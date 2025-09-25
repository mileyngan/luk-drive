const { supabase } = require('../config/database');

const getChapters = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { program_type } = req.query;

    let query = supabase
      .from('chapters')
      .select('*')
      .eq('school_id', school_id);

    if (program_type) query = query.eq('program_type', program_type);

    const {  chapters, error } = await query;

    if (error) throw error;

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createChapter = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { title, description, program_type, chapter_number, video_url, ebook_content, is_published } = req.body;

    const {  chapter, error } = await supabase
      .from('chapters')
      .insert([{
        school_id,
        title,
        description,
        program_type,
        chapter_number,
        video_url,
        ebook_content,
        is_published: is_published || false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, program_type, chapter_number, video_url, ebook_content, is_published } = req.body;

    const {  chapter, error } = await supabase
      .from('chapters')
      .update({
        title,
        description,
        program_type,
        chapter_number,
        video_url,
        ebook_content,
        is_published
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) throw error;

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChapters, createChapter, updateChapter, deleteChapter };