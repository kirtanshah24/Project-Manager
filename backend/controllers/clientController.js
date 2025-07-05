import Client from '../models/ClientModel.js';

// @desc    Add new client
// @route   POST /api/clients
// @access  Private
export const addClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      notes,
      status,
      taxId,
      website,
      contactPerson,
      paymentTerms
    } = req.body;

    // Check if required fields are provided
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if client with same email already exists for this user
    const existingClient = await Client.findOne({
      userId: req.user.id,
      email: email.toLowerCase()
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'A client with this email already exists'
      });
    }

    // Create new client
    const client = await Client.create({
      userId: req.user.id,
      name,
      email: email.toLowerCase(),
      phone,
      company,
      address,
      notes,
      status: status || 'active',
      taxId,
      website,
      contactPerson,
      paymentTerms: paymentTerms || 30
    });

    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      data: {
        client
      }
    });

  } catch (error) {
    console.error('Add client error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get all clients for user
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = { userId: req.user.id };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const clients = await Client.paginate(query, options);

    res.status(200).json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        client
      }
    });

  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      notes,
      status,
      taxId,
      website,
      contactPerson,
      paymentTerms
    } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if email is being updated and if it conflicts with another client
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({
        userId: req.user.id,
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'A client with this email already exists'
        });
      }
    }

    // Update client
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email: email ? email.toLowerCase() : client.email,
        phone,
        company,
        address,
        notes,
        status,
        taxId,
        website,
        contactPerson,
        paymentTerms
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: {
        client: updatedClient
      }
    });

  } catch (error) {
    console.error('Update client error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 