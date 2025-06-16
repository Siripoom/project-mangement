"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginForm({ onLogin, loading }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const { email, password } = values;
      const result = await onLogin(email, password, isSignUp);

      if (result.error) {
        message.error(result.error.message || "เกิดข้อผิดพลาด");
      } else {
        message.success(isSignUp ? "สมัครสมาชิกสำเร็จ!" : "เข้าสู่ระบบสำเร็จ!");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    form.resetFields();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: "8px" }}>
            Project Manager
          </Title>
          <Text type="secondary">
            {isSignUp ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบจัดการโปรเจค"}
          </Text>
        </div>

        <Form
          form={form}
          name="auth"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
          </Form.Item>

          {isSignUp && (
            <Form.Item
              name="confirmPassword"
              label="ยืนยันรหัสผ่าน"
              dependencies={["password"]}
              rules={[
                { required: true, message: "กรุณายืนยันรหัสผ่าน" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("รหัสผ่านไม่ตรงกัน");
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="ยืนยันรหัสผ่าน"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: "45px", fontSize: "16px" }}
            >
              {isSignUp ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </Button>
          </Form.Item>
        </Form>

        <Divider>หรือ</Divider>

        <div style={{ textAlign: "center" }}>
          <Text>
            {isSignUp ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
            <Button
              type="link"
              onClick={toggleMode}
              style={{ padding: 0, fontSize: "14px" }}
            >
              {isSignUp ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
}
