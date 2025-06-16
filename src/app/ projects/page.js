"use client";

import { useState } from "react";
import {
  Layout,
  Table,
  Button,
  Space,
  Tag,
  Card,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Tooltip,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/th";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// กำหนด locale เป็นไทย
dayjs.locale("th");

export default function ProjectsPage() {
  const { projects, loading, deleteProject } = useProjects();
  const { isAuthenticated } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  if (!isAuthenticated) {
    return null;
  }

  // สถานะของโปรเจค
  const statusOptions = [
    { value: "all", label: "ทั้งหมด", color: "" },
    { value: "todo", label: "รอดำเนินการ", color: "default" },
    { value: "in_progress", label: "กำลังดำเนินการ", color: "processing" },
    { value: "done", label: "เสร็จสิ้น", color: "success" },
    { value: "delay", label: "ล่าช้า", color: "error" },
    { value: "maintenance", label: "บำรุงรักษา", color: "warning" },
  ];

  // กรองข้อมูล
  const filteredProjects = projects.filter((project) => {
    // กรองตามชื่อโปรเจค
    const matchSearch =
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchText.toLowerCase()));

    // กรองตามสถานะ
    const matchStatus =
      statusFilter === "all" || project.status === statusFilter;

    // กรองตามช่วงวันที่
    let matchDate = true;
    if (dateRange && dateRange.length === 2) {
      const startDate = dayjs(project.start_date);
      const endDate = dayjs(project.end_date);
      const filterStart = dateRange[0];
      const filterEnd = dateRange[1];

      matchDate =
        (startDate.isAfter(filterStart) || startDate.isSame(filterStart)) &&
        (endDate.isBefore(filterEnd) || endDate.isSame(filterEnd));
    }

    return matchSearch && matchStatus && matchDate;
  });

  // คำนวณความคืบหน้า (ตัวอย่าง)
  const calculateProgress = (project) => {
    if (project.status === "done") return 100;
    if (project.status === "todo") return 0;
    if (project.status === "in_progress") return 50;
    if (project.status === "delay") return 30;
    if (project.status === "maintenance") return 80;
    return 0;
  };

  // คำนวณวันที่เหลือ
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = dayjs();
    const end = dayjs(endDate);
    const diff = end.diff(today, "day");

    if (diff < 0) return { days: Math.abs(diff), status: "overdue" };
    if (diff === 0) return { days: 0, status: "today" };
    if (diff <= 7) return { days: diff, status: "warning" };
    return { days: diff, status: "normal" };
  };

  // ลบโปรเจค
  const handleDelete = (project) => {
    Modal.confirm({
      title: "ยืนยันการลบโปรเจค",
      content: `คุณต้องการลบโปรเจค "${project.name}" ใช่หรือไม่?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        const result = await deleteProject(project.id);
        if (result.success) {
          message.success("ลบโปรเจคสำเร็จ");
        }
      },
    });
  };

  // คอลัมน์ของตาราง
  const columns = [
    {
      title: "ชื่อโปรเจค",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div>
          <Link href={`/projects/${record.id}`}>
            <Button type="link" style={{ padding: 0, fontWeight: "bold" }}>
              {text}
            </Button>
          </Link>
          {record.description && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.description.length > 50
                ? record.description.substring(0, 50) + "..."
                : record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusObj = statusOptions.find((s) => s.value === status);
        return (
          <Tag color={statusObj?.color || "default"}>
            {statusObj?.label || status}
          </Tag>
        );
      },
    },
    {
      title: "ความคืบหน้า",
      key: "progress",
      width: 150,
      render: (_, record) => {
        const progress = calculateProgress(record);
        return (
          <Progress
            percent={progress}
            size="small"
            status={record.status === "delay" ? "exception" : "normal"}
          />
        );
      },
    },
    {
      title: "วันที่เริ่ม",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (date, record) => {
        if (!date) return "-";

        const remaining = getDaysRemaining(date);
        const formattedDate = dayjs(date).format("DD/MM/YYYY");

        if (remaining?.status === "overdue") {
          return (
            <Tooltip title={`เลยกำหนด ${remaining.days} วัน`}>
              <span style={{ color: "#ff4d4f" }}>{formattedDate}</span>
            </Tooltip>
          );
        }

        if (remaining?.status === "warning") {
          return (
            <Tooltip title={`เหลือ ${remaining.days} วัน`}>
              <span style={{ color: "#fa8c16" }}>{formattedDate}</span>
            </Tooltip>
          );
        }

        return formattedDate;
      },
    },
    {
      title: "งบประมาณ",
      dataIndex: "budget",
      key: "budget",
      width: 120,
      render: (budget) =>
        budget ? `${parseFloat(budget).toLocaleString()} บาท` : "-",
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Link href={`/projects/${record.id}`}>
            <Tooltip title="ดูรายละเอียด">
              <Button icon={<EyeOutlined />} size="small" />
            </Tooltip>
          </Link>
          <Link href={`/projects/${record.id}/edit`}>
            <Tooltip title="แก้ไข">
              <Button icon={<EditOutlined />} size="small" />
            </Tooltip>
          </Link>
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
      <Card>
        {/* ส่วนค้นหาและกรอง */}
        <div style={{ marginBottom: "16px" }}>
          <Space wrap size="middle">
            <Search
              placeholder="ค้นหาโปรเจค..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />

            <Select
              placeholder="กรองตามสถานะ"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            <RangePicker
              placeholder={["วันเริ่ม", "วันสิ้นสุด"]}
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />

            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setDateRange(null);
              }}
            >
              ล้างตัวกรอง
            </Button>

            <Link href="/projects/create">
              <Button type="primary" icon={<PlusOutlined />}>
                เพิ่มโปรเจคใหม่
              </Button>
            </Link>
          </Space>
        </div>

        {/* ตาราง */}
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} โปรเจค`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </DashboardLayout>
  );
}
