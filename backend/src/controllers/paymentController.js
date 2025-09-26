const { supabase } = require('../config/database');

const processPayment = async (req, res) => {
  try {
    const { amount, payment_type, reference, payment_method, card_details } = req.body;
    const { user_id, school_id } = req.user;

    // In a real app, integrate with payment gateway (Paystack, Flutterwave, etc.)
    // For demo, we'll simulate payment processing
    
    const payment = {
      user_id: user_id,
      school_id: school_id,
      amount: amount,
      currency: 'XAF',
      payment_method: payment_method,
      payment_status: 'completed', // Simulate success
      payment_type: payment_type,
      reference: reference
    };

    const {  result, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      payment: result 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { user_id, school_id } = req.user;

    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.user.role === 'student') {
      query = query.eq('user_id', user_id);
    } else if (req.user.role === 'admin') {
      query = query.eq('school_id', school_id);
    }

    const {  payments, error } = await query;

    if (error) throw error;

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { processPayment, getPayments };