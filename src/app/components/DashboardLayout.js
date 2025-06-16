"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Space, Typography, Spin } from "antd";
import {
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  BellOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ถ้ายังไม่ได้ login ให้ redirect กลับไปหน้าแรก
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // ถ้ายังโหลด auth อยู่
  if (loading) {
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
        <div style={{ marginLeft: "16px" }}>กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // Menu items สำหรับ Sidebar
  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/projects",
      icon: <ProjectOutlined />,
      label: <Link href="/projects">โปรเจค</Link>,
    },
    {
      key: "/team",
      icon: <TeamOutlined />,
      label: <Link href="/team">ทีมงาน</Link>,
    },
    {
      key: "/finance",
      icon: <DollarOutlined />,
      label: <Link href="/finance">การเงิน</Link>,
    },
    {
      key: "/notifications",
      icon: <BellOutlined />,
      label: "แจ้งเตือน",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
    },
  ];

  // หา current page title
  const getCurrentPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.includes("/projects")) return "จัดการโปรเจค";
    if (pathname.includes("/team")) return "จัดการทีมงาน";
    if (pathname.includes("/finance")) return "จัดการการเงิน";
    if (pathname.includes("/settings")) return "ตั้งค่าระบบ";
    return "Dashboard";
  };

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
          selectedKeys={[pathname]}
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
            {getCurrentPageTitle()}
          </Title>

          <Space size="middle">
            {/* User info */}
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: "#666" }}>{user?.email}</span>
            </Space>

            {/* Logout button */}
            <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
              ออกจากระบบ
            </Button>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: "24px",
            minHeight: "calc(100vh - 112px)", // 64px header + 48px margin
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
