import { Button, Card, Typography, Row, Col, Space, Statistic } from "antd"
import {
  ArrowRightOutlined,
  StarFilled,
  UserOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import "../styles/MainPage.css"

const { Title, Paragraph } = Typography

export default function MainPageNoUser() {
  const firstLine = '클릭 한 번이면 ';
  const secondLine = '상담봇이 완성';

  return (
    <div className="main-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <Space direction="vertical" size="large" className="hero-space">
            <div className="hero-title-container">
              {/* <Title level={1} className="hero-title">
                당신의 아이디어를
                <span className="hero-title-highlight"> 현실로</span> */}
              {/* </Title> */}
              <Paragraph className="hero-subtitle">
                자동으로 만들어지는 대화
              </Paragraph>
              <p className="line1">{firstLine}<span className="highlight">{secondLine}</span></p>
              {/* <div className="subtext">자동으로 만들어지는 대화<br/>
              클릭 한 번으로 상담봇을 완성하세요</div> */}
            </div>

            <Space size="middle" wrap className="hero-buttons">
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="btn-primary-custom">
                시작하기
              </Button>
              <Button size="large" className="btn-secondary-custom">
                더 알아보기
              </Button>
            </Space>

            <Space size="large" wrap className="hero-stats">
              <Space>
                <StarFilled className="star-icon" />
                <span>4.9/5 평점</span>
              </Space>
              <Space>
                <UserOutlined />
                <span>10,000+ 사용자</span>
              </Space>
            </Space>
          </Space>
        </div>
      </section>

      {/* IntroduceSection */}
      {/* <section className="introduce-section">
        <div className="introduce-header slide-up">
          <Title level={2} className="introduce-title">
            자동으로 만들어지는 대화
          </Title>
          <Paragraph className="introduce-subtitle">
            자동으로 만들어지는 대화
          </Paragraph>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="features-section">
        {/* <div className="features-header slide-up">
          <Title level={2} className="features-title">
            왜 우리를 선택해야 할까요?
          </Title>
          <Paragraph className="features-subtitle">
            검증된 기술과 혁신적인 접근으로 최고의 서비스를 제공합니다
          </Paragraph>
        </div> */}

        <Row gutter={[46, 46]} className="features-grid">
          <Col xs={24} md={8}>
            <Card className="feature-card slide-up" bordered={false} hoverable>
              <div className="feature-content">
                <div className="feature-icon-container feature-icon-blue">
                  <ThunderboltOutlined className="feature-icon" />
                </div>
                <Title level={4} className="feature-title">
                  클릭 한 번이면 챗봇 완성
                </Title>
                <Paragraph className="feature-description">
                  누구나 복잡한 개발 과정 없이,<br/>
                  버튼 클릭만으로 자신만의 AI 챗봇을 바로 만들 수 있어요
                </Paragraph>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="feature-card slide-up" bordered={false} hoverable>
              <div className="feature-content">
                <div className="feature-icon-container feature-icon-green">
                  <SafetyOutlined className="feature-icon" />
                </div>
                <Title level={4} className="feature-title">
                  내 데이터로 완벽한 맞춤 상담
                </Title>
                <Paragraph className="feature-description">
                  자사 데이터 업로드만으로 <br/>고객 응대/FAQ/업무 자동화에 최적화된 챗봇이 완성됩니다
                </Paragraph>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="feature-card slide-up" bordered={false} hoverable>
              <div className="feature-content">
                <div className="feature-icon-container feature-icon-purple">
                  <TeamOutlined className="feature-icon" />
                </div>
                <Title level={4} className="feature-title">
                  누구나 쉽게, 사용 현황 한눈에
                </Title>
                <Paragraph className="feature-description">
                  상담 내역, 사용자 통계, AI 답변 정확도를<br/>
                  한 화면에서 관리할 수 있습니다
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Card className="cta-container slide-up" bordered={false}>
          <Space direction="vertical" size="large" className="cta-content">
            <Title level={2} className="cta-title">
              지금 바로 시작하세요
            </Title>
            <Paragraph className="cta-subtitle">무료로 체험해보고 차이를 느껴보세요</Paragraph>
            <Space size="middle" wrap>
              <Button type="primary" size="large" className="btn-cta-primary">
                무료 체험 시작
              </Button>
              <Button size="large" className="btn-cta-secondary">
                데모 보기
              </Button>
            </Space>
          </Space>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Row gutter={[32, 32]} className="stats-grid slide-up">
          <Col xs={12} md={6}>
            <Statistic
              title="활성 사용자"
              value="10K+"
              valueStyle={{ color: "#2563eb", fontSize: "2.5rem", fontWeight: "bold" }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="가동률"
              value="99.9%"
              valueStyle={{ color: "#16a34a", fontSize: "2.5rem", fontWeight: "bold" }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="고객 지원"
              value="24/7"
              valueStyle={{ color: "#9333ea", fontSize: "2.5rem", fontWeight: "bold" }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="국가 서비스"
              value="50+"
              valueStyle={{ color: "#ea580c", fontSize: "2.5rem", fontWeight: "bold" }}
            />
          </Col>
        </Row>
      </section>
    </div>
  )
}
