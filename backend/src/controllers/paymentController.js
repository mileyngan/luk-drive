const { supabase } = require('../config/database');
const axios = require('axios');

// MTN Mobile Money Configuration (Mock)
const MTN_CONFIG = {
  baseUrl: process.env.MTN_BASE_URL || 'https://sandbox.mtn.com',
  apiKey: process.env.MTN_API_KEY,
  apiSecret: process.env.MTN_API_SECRET,
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY
};

// Orange Money Configuration (Mock)
const ORANGE_CONFIG = {
  baseUrl: process.env.ORANGE_BASE_URL || 'https://api.orange.com',
  clientId: process.env.ORANGE_CLIENT_ID,
  clientSecret: process.env.ORANGE_CLIENT_SECRET
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  basic: { price: 5000, duration: 30, features: ['Basic access', 'Limited simulations'] },
  pro: { price: 15000, duration: 30, features: ['Full access', 'Unlimited simulations', 'Priority support'] },
  enterprise: { price: 50000, duration: 365, features: ['Everything', 'Custom integrations', 'Dedicated support'] }
};

const processPayment = async (req, res) => {
  try {
    const { amount, payment_type, reference, payment_method, card_details, phone_number, provider } = req.body;
    const { user_id, school_id } = req.user;

    let paymentResult = null;
    let paymentStatus = 'pending';

    // Process payment based on method
    switch (payment_method) {
      case 'mtn_mobile_money':
        paymentResult = await processMTNPayment(amount, phone_number, reference);
        paymentStatus = paymentResult.success ? 'completed' : 'failed';
        break;

      case 'orange_money':
        paymentResult = await processOrangePayment(amount, phone_number, reference);
        paymentStatus = paymentResult.success ? 'completed' : 'failed';
        break;

      case 'card':
        paymentResult = await processCardPayment(amount, card_details, reference);
        paymentStatus = paymentResult.success ? 'completed' : 'failed';
        break;

      default:
        throw new Error('Unsupported payment method');
    }

    // Create payment record
    const payment = {
      user_id: user_id,
      school_id: school_id,
      amount: amount,
      currency: 'XAF',
      payment_method: payment_method,
      payment_status: paymentStatus,
      payment_type: payment_type,
      reference: reference,
      provider_reference: paymentResult?.reference || null,
      metadata: {
        phone_number,
        provider,
        gateway_response: paymentResult
      }
    };

    const { result, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;

    // If payment successful and it's a subscription, create subscription
    if (paymentStatus === 'completed' && payment_type === 'subscription') {
      await createSubscription(user_id, payment_type, result.id);
    }

    res.json({
      success: paymentStatus === 'completed',
      message: paymentResult?.message || 'Payment processed',
      payment: result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processMTNPayment = async (amount, phoneNumber, reference) => {
  try {
    // Mock MTN Mobile Money API call
    // In production, this would make actual API calls to MTN's payment gateway

    const mockResponse = {
      success: Math.random() > 0.1, // 90% success rate for demo
      reference: `MTN-${Date.now()}`,
      message: 'Payment processed via MTN Mobile Money'
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!mockResponse.success) {
      throw new Error('MTN payment failed - insufficient funds or network error');
    }

    return mockResponse;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      reference: null
    };
  }
};

const processOrangePayment = async (amount, phoneNumber, reference) => {
  try {
    // Mock Orange Money API call
    // In production, this would make actual API calls to Orange's payment gateway

    const mockResponse = {
      success: Math.random() > 0.1, // 90% success rate for demo
      reference: `ORANGE-${Date.now()}`,
      message: 'Payment processed via Orange Money'
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!mockResponse.success) {
      throw new Error('Orange payment failed - insufficient funds or network error');
    }

    return mockResponse;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      reference: null
    };
  }
};

const processCardPayment = async (amount, cardDetails, reference) => {
  try {
    // Mock card payment processing
    // In production, this would integrate with Paystack, Flutterwave, or Stripe

    const mockResponse = {
      success: Math.random() > 0.05, // 95% success rate for demo
      reference: `CARD-${Date.now()}`,
      message: 'Payment processed via card'
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!mockResponse.success) {
      throw new Error('Card payment failed - invalid card details or insufficient funds');
    }

    return mockResponse;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      reference: null
    };
  }
};

const createSubscription = async (userId, planType, paymentId) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) throw new Error('Invalid subscription plan');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = {
      user_id: userId,
      plan_type: planType,
      payment_id: paymentId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      features: plan.features,
      price: plan.price
    };

    const { result, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) throw error;

    return result;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
};

const getPayments = async (req, res) => {
  try {
    const { user_id, school_id } = req.user;

    let query = supabase
      .from('payments')
      .select(`
        *,
        subscriptions(*)
      `)
      .order('created_at', { ascending: false });

    if (req.user.role === 'student') {
      query = query.eq('user_id', user_id);
    } else if (req.user.role === 'admin') {
      query = query.eq('school_id', school_id);
    }

    const { payments, error } = await query;

    if (error) throw error;

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubscriptionPlans = async (req, res) => {
  try {
    res.json({
      plans: SUBSCRIPTION_PLANS,
      currency: 'XAF'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserSubscription = async (req, res) => {
  try {
    const { user_id } = req.user;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        payments(*)
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    res.json({
      subscription: subscription || null,
      hasActiveSubscription: !!subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { subscription_id } = req.params;

    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError) throw fetchError;
    if (!subscription) throw new Error('Subscription not found');

    const { result, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription_id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processPayment,
  getPayments,
  getSubscriptionPlans,
  getUserSubscription,
  cancelSubscription
};
