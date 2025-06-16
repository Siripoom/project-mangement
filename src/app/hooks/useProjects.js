"use client";

import { useState, useEffect } from "react";
import { projectService } from "@/app/services/project";
import { message } from "antd";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูลโปรเจคทั้งหมด
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await projectService.getProjects();

      if (error) throw error;

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
      message.error("ไม่สามารถดึงข้อมูลโปรเจคได้");
    } finally {
      setLoading(false);
    }
  };

  // สร้างโปรเจคใหม่
  const createProject = async (projectData) => {
    try {
      setLoading(true);

      const { data, error } = await projectService.createProject(projectData);

      if (error) throw error;

      // เพิ่มโปรเจคใหม่เข้าไปใน state
      setProjects((prev) => [data[0], ...prev]);
      message.success("สร้างโปรเจคสำเร็จ!");

      return { success: true, data: data[0] };
    } catch (err) {
      console.error("Error creating project:", err);
      message.error("ไม่สามารถสร้างโปรเจคได้");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // อัพเดทโปรเจค
  const updateProject = async (id, updates) => {
    try {
      setLoading(true);

      const { data, error } = await projectService.updateProject(id, updates);

      if (error) throw error;

      // อัพเดท state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...data[0] } : project
        )
      );

      message.success("อัพเดทโปรเจคสำเร็จ!");
      return { success: true, data: data[0] };
    } catch (err) {
      console.error("Error updating project:", err);
      message.error("ไม่สามารถอัพเดทโปรเจคได้");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ลบโปรเจค
  const deleteProject = async (id) => {
    try {
      setLoading(true);

      const { error } = await projectService.deleteProject(id);

      if (error) throw error;

      // ลบออกจาก state
      setProjects((prev) => prev.filter((project) => project.id !== id));
      message.success("ลบโปรเจคสำเร็จ!");

      return { success: true };
    } catch (err) {
      console.error("Error deleting project:", err);
      message.error("ไม่สามารถลบโปรเจคได้");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // คำนวณสถิติ
  const getStats = () => {
    const total = projects.length;
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const totalBudget = projects.reduce(
      (sum, project) => sum + (parseFloat(project.budget) || 0),
      0
    );

    return {
      total,
      todo: byStatus.todo || 0,
      in_progress: byStatus.in_progress || 0,
      done: byStatus.done || 0,
      delay: byStatus.delay || 0,
      maintenance: byStatus.maintenance || 0,
      totalBudget,
    };
  };

  // เรียกใช้ครั้งแรกเมื่อ component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    stats: getStats(),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects, // alias สำหรับ refresh ข้อมูล
  };
}
