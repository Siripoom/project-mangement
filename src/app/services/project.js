import { supabase } from "@/app/config/supabase";

export const projectService = {
  // ดึงโปรเจคทั้งหมดของ user
  getProjects: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // ดึงโปรเจคตาม ID
  getProject: async (id) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  // สร้างโปรเจคใหม่
  createProject: async (projectData) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([projectData])
      .select();

    return { data, error };
  },

  // อัพเดทโปรเจค
  updateProject: async (id, updates) => {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  },

  // ลบโปรเจค
  deleteProject: async (id) => {
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    return { data, error };
  },
};
