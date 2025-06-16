"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import DashboardLayout from "@/components/DashboardLayout";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export default function FinancePage() {
  const { isAuthenticated } = useAuth();
  const { projects } = useProjects();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form] = Form.useForm();

  // ข้อมูลตัวอย่าง (ในการใช้งานจริงจะดึงจาก Supabase)
  useEffect(() => {
    setPayments([
      {
        id: "1",
        project_id: "1",
        project_name: "เว็บไซต์ E-commerce",
        amount: 100000,
        installment_number: 1,
        total_installments: 3,
        due_date: "2025-07-15",
        paid_date: "2025-07-10",
        status: "paid",
        description: "งวดที่ 1 - เริ่มโปรเจค",
      },
      {
        id: "2",
        project_id: "1",
        project_name: "เว็บไซต์ E-commerce",
        amount: 150000,
        installment_number: 2,
        total_installments: 3,
        due_date: "2025-08-15",
        paid_date: null,
        status: "pending",
        description: "งวดที่ 2 - ส่งมอบระบบ 50%",
      },
      {
        id: "3",
        project_id: "2",
        project_name: "แอปมือถือ",
        amount: 80000,
        installment_number: 1,
        total_installments: 2,
        due_date: "2025-06-30",
        paid_date: null,
        status: "overdue",
        description: "งวดที่ 1 - ออกแบบ UI/UX",
      },
    ]);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  // เปิด Modal สำหรับเพิ่ม/แก้ไขการจ่ายเงิน
  const showModal = (payment = null) => {
    setEditingPayment(payment);
    setIsModalVisible(true);

    if (payment) {
      form.setFieldsValue({
        ...payment,
        due_date: payment.due_date ? dayjs(payment.due_date) : null,
        paid_date: payment.paid_date ? dayjs(payment.paid_date) : null,
      });
    } else {
      form.resetFields();
    }
  };

  // ปิด Modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPayment(null);
    form.resetFields();
  };

  // บันทึกข้อมูลการจ่ายเงิน
  const handleSave = async (values) => {
    try {
      setLoading(true);

      const paymentData = {
        ...values,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
        paid_date: values.paid_date
          ? values.paid_date.format("YYYY-MM-DD")
          : null,
        project_name:
          projects.find((p) => p.id === values.project_id)?.name ||
          "Unknown Project",
      };

      if (editingPayment) {
        // แก้ไขการจ่ายเงิน
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === editingPayment.id
              ? { ...payment, ...paymentData }
              : payment
          )
        );
        message.success("แก้ไขข้อมูลการจ่ายเงินสำเร็จ");
      } else {
        // เพิ่มการจ่ายเงินใหม่
        const newPayment = {
          id: Date.now().toString(),
          ...paymentData,
          status: paymentData.paid_date ? "paid" : "pending",
        };
        setPayments((prev) => [...prev, newPayment]);
        message.success("เพิ่มการจ่ายเงินใหม่สำเร็จ");
      }

      handleCancel();
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // ลบการจ่ายเงิน
  const handleDelete = (payment) => {
    Modal.confirm({
      title: "ยืนยันการลบข้อมูลการจ่ายเงิน",
      content: `คุณต้องการลบการจ่ายเงินงวดที่ ${payment.installment_number} ของโปรเจค "${payment.project_name}" ใช่หรือไม่?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: () => {
        setPayments((prev) => prev.filter((p) => p.id !== payment.id));
        message.success("ลบข้อมูลการจ่ายเงินสำเร็จ");
      },
    });
  };

  // ทำเครื่องหมายจ่ายแล้ว
  const markAsPaid = (payment) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: "paid", paid_date: dayjs().format("YYYY-MM-DD") }
          : p
      )
    );
    message.success("ทำเครื่องหมายจ่ายแล้วสำเร็จ");
  };

  // คำนวณสถิติ
  const stats = {
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    overdueAmount: payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0),
    paidCount: payments.filter((p) => p.status === "paid").length,
    pendingCount: payments.filter((p) => p.status === "pending").length,
    overdueCount: payments.filter((p) => p.status === "overdue").length,
  };

  // คำนวณเปอร์เซ็นต์การจ่ายเงิน
  const paymentProgress =
    stats.totalAmount > 0
      ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
      : 0;

  // สถานะการจ่ายเงิน
  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "จ่ายแล้ว",
        };
      case "pending":
        return {
          color: "processing",
          icon: <ClockCircleOutlined />,
          text: "รอจ่าย",
        };
      case "overdue":
        return {
          color: "error",
          icon: <ExclamationCircleOutlined />,
          text: "เลยกำหนด",
        };
      default:
        return { color: "default", icon: null, text: status };
    }
  };

  // คอลัมน์ของตาราง
  const columns = [
    {
      title: "โปรเจค",
      dataIndex: "project_name",
      key: "project_name",
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            งวดที่ {record.installment_number}/{record.total_installments}
          </div>
        </div>
      ),
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: "bold", color: "#fa8c16" }}>
          {amount.toLocaleString()} บาท
        </span>
      ),
    },
    {
      title: "วันที่ครบกำหนด",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่จ่าย",
      dataIndex: "paid_date",
      key: "paid_date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          <span
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <Tooltip title="ทำเครื่องหมายจ่ายแล้ว">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => markAsPaid(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="แก้ไข">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* สถิติการเงิน */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="ยอดรวมทั้งหมด"
              value={stats.totalAmount}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="บาท"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="จ่ายแล้ว"
              value={stats.paidAmount}
              precision={0}
              prefix={<CheckCircleOutlined />}
              suffix="บาท"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="รอจ่าย"
              value={stats.pendingAmount}
              precision={0}
              prefix={<ClockCircleOutlined />}
              suffix="บาท"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="เลยกำหนด"
              value={stats.overdueAmount}
              precision={0}
              prefix={<ExclamationCircleOutlined />}
              suffix="บาท"
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Card */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div>
              <h3 style={{ margin: 0, marginBottom: "8px" }}>
                ความคืบหน้าการจ่ายเงิน
              </h3>
              <Progress
                percent={paymentProgress}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                style={{ marginBottom: "8px" }}
              />
              <div style={{ fontSize: "14px", color: "#666" }}>
                จ่ายแล้ว {stats.paidCount} จาก {payments.length} งวด
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Tag color="success">จ่ายแล้ว: {stats.paidCount} งวด</Tag>
                <Tag color="processing">รอจ่าย: {stats.pendingCount} งวด</Tag>
                <Tag color="error">เลยกำหนด: {stats.overdueCount} งวด</Tag>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ตารางการจ่ายเงิน */}
      <Card
        title="จัดการการจ่ายเงิน"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            เพิ่มการจ่ายเงิน
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal เพิ่ม/แก้ไขการจ่ายเงิน */}
      <Modal
        title={editingPayment ? "แก้ไขการจ่ายเงิน" : "เพิ่มการจ่ายเงินใหม่"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="project_id"
                label="โปรเจค"
                rules={[{ required: true, message: "กรุณาเลือกโปรเจค" }]}
              >
                <Select placeholder="เลือกโปรเจค">
                  {projects.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="จำนวนเงิน (บาท)"
                rules={[{ required: true, message: "กรุณากรอกจำนวนเงิน" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0"
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="installment_number"
                label="งวดที่"
                rules={[{ required: true, message: "กรุณากรอกงวดที่" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="1"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="total_installments"
                label="จำนวนงวดทั้งหมด"
                rules={[
                  { required: true, message: "กรุณากรอกจำนวนงวดทั้งหมด" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="1"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="วันที่ครบกำหนด"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่ครบกำหนด" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paid_date" label="วันที่จ่าย (ถ้าจ่ายแล้ว)">
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="รายละเอียด">
            <TextArea placeholder="รายละเอียดการจ่ายเงิน..." rows={3} />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPayment ? "บันทึก" : "เพิ่มการจ่ายเงิน"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
