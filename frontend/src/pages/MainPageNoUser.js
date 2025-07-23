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
  return (
    <div className="main-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <Space direction="vertical" size="large" className="hero-space">
            <div className="hero-title-container">
              <Title level={1} className="hero-title">
                당신의 아이디어를
                <span className="hero-title-highlight"> 현실로</span>
              </Title>
              <Paragraph className="hero-subtitle">
                혁신적인 솔루션으로 비즈니스를 성장시키고, 더 나은 미래를 만들어보세요
              </Paragraph>
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

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header slide-up">
          <Title level={2} className="features-title">
            왜 우리를 선택해야 할까요?
          </Title>
          <Paragraph className="features-subtitle">
            검증된 기술과 혁신적인 접근으로 최고의 서비스를 제공합니다
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} className="features-grid">
          <Col xs={24} md={8}>
            <Card className="feature-card slide-up" bordered={false} hoverable>
              <div className="feature-content">
                <div className="feature-icon-container feature-icon-blue">
                  <ThunderboltOutlined className="feature-icon" />
                </div>
                <Title level={4} className="feature-title">
                  빠른 성능
                </Title>
                <Paragraph className="feature-description">
                  최적화된 시스템으로 빠르고 안정적인 서비스를 경험하세요
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
                  안전한 보안
                </Title>
                <Paragraph className="feature-description">
                  최고 수준의 보안 시스템으로 데이터를 안전하게 보호합니다
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
                  24/7 지원
                </Title>
                <Paragraph className="feature-description">
                  언제든지 도움이 필요할 때 전문가 팀이 지원해드립니다
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
