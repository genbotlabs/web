import uuid 

def generate_unique_id():
    unique_id = uuid.uuid4()
    while check_id_duplicate(unique_id):
        unique_id = uuid.uuid4()
    return unique_id

def check_id_duplicate(id):
    return False