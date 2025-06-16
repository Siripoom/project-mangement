"use client"; // สำคัญ! ใน Next.js 13+ ต้องใส่ถ้าใช้ React hooks

import { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  Avatar,
} from "antd";
import {
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  BellOutlined,
  PlusOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/app/hooks/useAuth";
import { useProjects } from "@/app/hooks/useProjects";
import LoginForm from "@/app/components/LoginForm";

const { Header, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  } = useAuth();
  const { projects, loading: projectsLoading, stats, refetch } = useProjects();

  // ถ้ายังโหลด auth อยู่
  if (authLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // ถ้ายังไม่ได้ login
  if (!isAuthenticated) {
    const handleAuth = async (email, password, isSignUp) => {
      if (isSignUp) {
        return await signUp(email, password);
      } else {
        return await signIn(email, password);
      }
    };

    return <LoginForm onLogin={handleAuth} loading={authLoading} />;
  }

  // Menu items สำหรับ Sidebar
  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "projects",
      icon: <ProjectOutlined />,
      label: "โปรเจค",
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "ทีมงาน",
    },
    {
      key: "finance",
      icon: <DollarOutlined />,
      label: "การเงิน",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "แจ้งเตือน",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "PM" : "Project Manager"}
          </Title>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{ borderRight: 0, marginTop: "16px" }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Title>

          <Space>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.email}</span>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              เพิ่มโปรเจคใหม่
            </Button>
            <Button icon={<LogoutOutlined />} onClick={signOut}>
              ออกจากระบบ
            </Button>
          </Space>
        </Header>

        {/* Main Content */}
        <Content style={{ margin: "24px" }}>
          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>กำลังโหลดข้อมูล...</div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="โปรเจคทั้งหมด"
                      value={stats.total}
                      valueStyle={{ color: "#1890ff" }}
                      prefix={<ProjectOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="กำลังดำเนินการ"
                      value={stats.in_progress}
                      valueStyle={{ color: "#52c41a" }}
                      prefix={<ProjectOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="เสร็จสิ้นแล้ว"
                      value={stats.done}
                      valueStyle={{ color: "#722ed1" }}
                      prefix={<ProjectOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="งบประมาณรวม"
                      value={stats.totalBudget}
                      precision={2}
                      valueStyle={{ color: "#fa8c16" }}
                      prefix={<DollarOutlined />}
                      suffix="บาท"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Welcome Card หรือ Recent Projects */}
              {stats.total === 0 ? (
                <Card>
                  <Title level={2}>ยินดีต้อนรับสู่ระบบจัดการโปรเจค! 🎉</Title>
                  <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>
                    ระบบนี้จะช่วยให้คุณจัดการโปรเจค ทีมงาน
                    และการเงินได้อย่างมีประสิทธิภาพ
                  </Paragraph>

                  <Space size="large" wrap>
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                      สร้างโปรเจคแรก
                    </Button>
                    <Button size="large" icon={<TeamOutlined />}>
                      เพิ่มทีมงาน
                    </Button>
                    <Button size="large" icon={<BellOutlined />}>
                      ตั้งค่าแจ้งเตือน
                    </Button>
                  </Space>
                </Card>
              ) : (
                <Card title="โปรเจคล่าสุด">
                  <Row gutter={[16, 16]}>
                    {projects.slice(0, 6).map((project) => (
                      <Col xs={24} sm={12} lg={8} key={project.id}>
                        <Card
                          size="small"
                          title={project.name}
                          extra={
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                background:
                                  project.status === "done"
                                    ? "#f6ffed"
                                    : project.status === "in_progress"
                                    ? "#e6f7ff"
                                    : "#fff7e6",
                                color:
                                  project.status === "done"
                                    ? "#52c41a"
                                    : project.status === "in_progress"
                                    ? "#1890ff"
                                    : "#fa8c16",
                              }}
                            >
                              {project.status === "todo" && "รอดำเนินการ"}
                              {project.status === "in_progress" &&
                                "กำลังดำเนินการ"}
                              {project.status === "done" && "เสร็จสิ้น"}
                              {project.status === "delay" && "ล่าช้า"}
                              {project.status === "maintenance" && "บำรุงรักษา"}
                            </span>
                          }
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "#666",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {project.description || "ไม่มีรายละเอียด"}
                          </p>
                          {project.budget && (
                            <p
                              style={{
                                margin: "8px 0 0 0",
                                fontWeight: "bold",
                                color: "#fa8c16",
                              }}
                            >
                              งบประมาณ:{" "}
                              {parseFloat(project.budget).toLocaleString()} บาท
                            </p>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {projects.length > 6 && (
                    <div style={{ textAlign: "center", marginTop: "16px" }}>
                      <Button type="link">
                        ดูโปรเจคทั้งหมด ({projects.length})
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
