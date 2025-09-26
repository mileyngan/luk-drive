const { supabase } = require('../config/database');
const piracyService = require('../services/piracyService');

const getChapters = async (req, res) => {
  try {
    console.log('GetChapters - Authenticated user:', req.user); // Debug log
    const { school_id } = req.user;
    const { program_type } = req.query;

    console.log('GetChapters - School ID from token:', school_id); // Debug log
    console.log('GetChapters - Program type:', program_type); // Debug log

    if (!school_id) {
      return res.status(400).json({ error: 'No school_id found in token' });
    }

    let query = supabase
      .from('chapters')
      .select('*')
      .eq('school_id', school_id);

    if (program_type) {
      query = query.eq('program_type', program_type);
      console.log('Filtering by program_type:', program_type); // Debug log
    }

    const result = await query;
    console.log('Supabase chapters result:', result); // Debug log

    if (result.error) {
      console.error('Supabase chapters query error:', result.error);
      throw result.error;
    }

    console.log('Chapters fetched from DB:', result.data); // Debug log
    res.json(result.data || []);
  } catch (error) {
    console.error('GetChapters error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createChapter = async (req, res) => {
  try {
    console.log('CreateChapter - Authenticated user:', req.user); // Debug log
    const { school_id } = req.user;
    const { title, description, program_type, chapter_number, video_url, ebook_content, is_published } = req.body;

    console.log('CreateChapter - School ID from token:', school_id); // Debug log
    console.log('CreateChapter - Data received:', { title, description, program_type, chapter_number, video_url, ebook_content, is_published }); // Debug log

    if (!school_id) {
      return res.status(400).json({ error: 'No school_id found in token' });
    }

    const result = await supabase
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

    if (result.error) {
      console.error('Chapter creation error:', result.error);
      throw result.error;
    }

    console.log('Chapter created successfully:', result.data); // Debug log
    res.status(201).json(result.data);
  } catch (error) {
    console.error('CreateChapter error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, program_type, chapter_number, video_url, ebook_content, is_published } = req.body;

    const result = await supabase
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

    if (result.error) throw result.error;

    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const result = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (result.error) throw result.error;

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { user_id } = req.user;

    // Get chapter with encrypted content
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('ebook_content')
      .eq('id', chapterId)
      .single();

    if (error) throw error;

    // Return encrypted content - frontend will decrypt with session key
    res.json({
      encryptedContent: chapter.ebook_content,
      userId: user_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const validateChapterAccess = async (req, res) => {
  try {
    const { chapterId, deviceFingerprint } = req.body;
    const { user_id, school_id } = req.user;

    const validation = await piracyService.validateAccess(user_id, chapterId, deviceFingerprint);

    if (!validation.valid) {
      await piracyService.logIncident(user_id, school_id, validation.reason, {
        chapterId,
        deviceFingerprint
      });
    }

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChapters, createChapter, updateChapter, deleteChapter, getChapterContent, validateChapterAccess };
