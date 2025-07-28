import os
import boto3
import glob
import pickle
import shutil
import logging
from pathlib import Path
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from teddynote_parser_client.client import TeddyNoteParserClient
from langchain_core.documents import Document
import smtplib
from email.mime.text import MIMEText

load_dotenv()
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# S3 클라이언트 설정
s3 = boto3.client(
    's3',
    region_name=os.getenv("AWS_S3_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def load_documents_from_pkl(pkl_path: str):
    """Pickle 파일에서 Langchain Document 리스트를 불러오는 함수"""
    abs_path = os.path.abspath(pkl_path)
    with open(abs_path, "rb") as f:
        raw = pickle.load(f)

    documents = []
    for doc in raw:
        if isinstance(doc, Document):
            documents.append(doc)
        elif isinstance(doc, dict) and "page_content" in doc:
            documents.append(Document(**doc))
        else:
            print(f"[경고] 예상치 못한 형식: {type(doc)} in {pkl_path}")
    return documents

def parse_pdfs_from_s3(bucket_name: str, base_folder: str):
    logger = logging.getLogger("teddynote_parser_client")
    logging.basicConfig(level=logging.INFO)

    API_URL = os.getenv("PARSER_API_URL")
    UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    client = TeddyNoteParserClient(
        api_url=API_URL,
        upstage_api_key=UPSTAGE_API_KEY,
        openai_api_key=OPENAI_API_KEY,
        batch_size=50,
        language="Korean",
        include_image=True,
        logger=logger,
    )

    print("Parser API 사용 가능")

    health_status = client.health_check()
    if health_status["status"] != "ok":
        print("Parser API 사용 불가1")
        raise Exception("Parser API 사용 불가2")

    input_prefix = f"{base_folder}/input/"
    output_prefix = f"{base_folder}/output/"
    vectordb_prefix = f"{base_folder}/vectordb/"

    # 임시 디렉터리 설정
    temp_dir = Path("/tmp") / base_folder
    input_dir = temp_dir / "input"
    output_dir = temp_dir / "output"
    vectordb_dir = temp_dir / "vectordb"
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    vectordb_dir.mkdir(parents=True, exist_ok=True)

    # S3에서 input PDF 다운로드
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=input_prefix)
    pdf_files = [item["Key"] for item in response.get("Contents", []) if item["Key"].endswith(".pdf")]

    for s3_key in pdf_files:
        filename = s3_key.split('/')[-1]
        local_pdf_path = input_dir / filename
        s3.download_file(bucket_name, s3_key, str(local_pdf_path))

        parse_result = client.parse_pdf(pdf_path=str(local_pdf_path), batch_size=50, language="Korean")
        job_id = parse_result["job_id"]
        final_status = client.wait_for_job_completion(job_id, check_interval=5, max_attempts=60)

        if final_status["status"] == "completed":
            zip_path, extract_path = client.download_result(
                job_id=job_id,
                save_dir=str(output_dir),
                extract=True,
                overwrite=True
            )
            print(f"✅ 파싱 완료: {zip_path}, 압축해제: {extract_path}")
        else:
            raise Exception(f"파싱 실패: {final_status.get('error')}")

    # 파싱된 결과물 S3 output 폴더에 업로드
    for root, _, files in os.walk(output_dir):
        for file in files:
            local_result_path = Path(root) / file
            s3_result_key = os.path.join(output_prefix, file)
            s3.upload_file(str(local_result_path), bucket_name, s3_result_key)

    # load_documents_from_pkl 함수 사용하여 .pkl 로드
    pkl_files = glob.glob(str(output_dir / "**" / "*.pkl"),recursive=True)
    print("[DEBUG] pkl_files:", pkl_files)
    all_documents = []
    for pkl_file in pkl_files:
        docs = load_documents_from_pkl(pkl_file)
        print(f"[INFO] {pkl_file} → {len(docs)}개 문서 로드됨")
        all_documents.extend(docs)

    if not all_documents:
        raise ValueError("Document 리스트가 비어 있습니다. pkl 파일 확인 필요")

    # 임베딩, 벡터DB 생성
    embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large-instruct")
    vectorstore = FAISS.from_documents(all_documents, embeddings)

    # FAISS 벡터DB 저장
    vectorstore.save_local(str(vectordb_dir))

    # 벡터DB S3에 업로드
    for root, _, files in os.walk(vectordb_dir):
        for file in files:
            local_vector_path = Path(root) / file
            relative_path = local_vector_path.relative_to(vectordb_dir)
            s3_vector_key = os.path.join(vectordb_prefix, str(relative_path))
            s3.upload_file(str(local_vector_path), bucket_name, s3_vector_key)

    # 임시파일 삭제
    shutil.rmtree(temp_dir)
    print("임시파일 정리 완료!")

    return "✅ PDF 파싱 및 벡터DB 생성, 결과 S3에 저장 완료"

def send_email_notification(to_email, bot_name):
    EMAIL = os.getenv("GMAIL")
    PASSWORD = os.getenv("GMAIL_PASSWORD")
    msg = MIMEText(f"'{bot_name}' 봇이 생성되었습니다.")
    msg['Subject'] = f"[GenBot] '{bot_name}' 생성 완료 안내"
    msg['From'] = EMAIL
    msg['To'] = to_email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)