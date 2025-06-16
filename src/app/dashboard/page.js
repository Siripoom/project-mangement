"use client";

import { useState } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Spin,
  Layout,
  Menu,
  Avatar,
} from "antd";
import {
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title, Paragraph } = Typography;
const { Header, Sider, Content } = Layout;

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut, loading: authLoading, isAuthenticated } = useAuth();
  const { projects, loading: projectsLoading, stats } = useProjects();
  const router = useRouter();

  // ถ้ายังไม่ login
  if (!isAuthenticated && !authLoading) {
    router.push("/");
    return null;
  }

  if (authLoading || projectsLoading) {
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
        <div style={{ marginLeft: "16px" }}>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  // Menu items สำหรับ Sidebar
  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "projects",
      icon: <ProjectOutlined />,
      label: <Link href="/projects">โปรเจค</Link>,
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: <Link href="/team">ทีมงาน</Link>,
    },
    {
      key: "finance",
      icon: <DollarOutlined />,
      label: <Link href="/finance">การเงิน</Link>,
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "แจ้งเตือน",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
    },
  ];

  // คำนวณโปรเจคที่ใกล้ deadline
  const upcomingDeadlines = projects.filter((project) => {
    if (!project.end_date || project.status === "done") return false;

    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7 && diffDays >= 0;
  });

  // โปรเจคที่ล่าช้า
  const delayedProjects = projects.filter(
    (project) =>
      project.status === "delay" ||
      (project.end_date &&
        new Date(project.end_date) < new Date() &&
        project.status !== "done")
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
        breakpoint="lg"
        collapsedWidth="0"
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
          selectedKeys={["dashboard"]}
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

          <Space size="middle">
            <Link href="/projects/create">
              <Button type="primary" icon={<PlusOutlined />} size="large">
                เพิ่มโปรเจค
              </Button>
            </Link>

            <Space>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: "#666" }}>{user?.email}</span>
            </Space>

            <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
              ออกจากระบบ
            </Button>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: "24px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
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

          {/* Alert Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            {upcomingDeadlines.length > 0 && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: "#fa8c16" }} />
                      <span>ใกล้ถึง Deadline</span>
                    </Space>
                  }
                  style={{ border: "1px solid #fa8c16" }}
                >
                  {upcomingDeadlines.slice(0, 3).map((project) => (
                    <div key={project.id} style={{ marginBottom: "8px" }}>
                      <Link href={`/projects/${project.id}`}>
                        <Button type="link" style={{ padding: 0 }}>
                          {project.name}
                        </Button>
                      </Link>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        สิ้นสุด:{" "}
                        {new Date(project.end_date).toLocaleDateString("th-TH")}
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            )}

            {delayedProjects.length > 0 && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                      <span>โปรเจคล่าช้า</span>
                    </Space>
                  }
                  style={{ border: "1px solid #ff4d4f" }}
                >
                  {delayedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} style={{ marginBottom: "8px" }}>
                      <Link href={`/projects/${project.id}`}>
                        <Button
                          type="link"
                          style={{ padding: 0, color: "#ff4d4f" }}
                        >
                          {project.name}
                        </Button>
                      </Link>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        ควรเสร็จ:{" "}
                        {new Date(project.end_date).toLocaleDateString("th-TH")}
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            )}
          </Row>

          {/* Main Content */}
          {stats.total === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <ProjectOutlined
                  style={{
                    fontSize: "64px",
                    color: "#d9d9d9",
                    marginBottom: "16px",
                  }}
                />
                <Title level={2}>ยินดีต้อนรับสู่ระบบจัดการโปรเจค! 🎉</Title>
                <Paragraph
                  style={{
                    fontSize: "16px",
                    marginBottom: "32px",
                    color: "#666",
                  }}
                >
                  เริ่มต้นจัดการโปรเจคของคุณอย่างมีระบบ ติดตามงาน บริหารทีม
                  และควบคุมงบประมาณ
                </Paragraph>

                <Space size="large" wrap>
                  <Link href="/projects/create">
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                      สร้างโปรเจคแรก
                    </Button>
                  </Link>
                  <Link href="/team">
                    <Button size="large" icon={<TeamOutlined />}>
                      เพิ่มทีมงาน
                    </Button>
                  </Link>
                  <Button size="large" icon={<CalendarOutlined />}>
                    ตั้งค่าแจ้งเตือน
                  </Button>
                </Space>
              </div>
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
                          {project.status === "in_progress" && "กำลังดำเนินการ"}
                          {project.status === "done" && "เสร็จสิ้น"}
                          {project.status === "delay" && "ล่าช้า"}
                          {project.status === "maintenance" && "บำรุงรักษา"}
                        </span>
                      }
                      actions={[
                        <Link href={`/projects/${project.id}`} key="view">
                          <Button type="link" size="small">
                            ดูรายละเอียด
                          </Button>
                        </Link>,
                      ]}
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
                  <Link href="/projects">
                    <Button type="primary">
                      ดูโปรเจคทั้งหมด ({projects.length})
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
