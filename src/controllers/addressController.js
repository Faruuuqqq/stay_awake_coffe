const addressModel = require('../models/addressModel');

exports.createAddress = async (req, res) => {
  const userId = req.userId;
  const { phone, address, city, postal_code } = req.body;

  if (!phone || !address || !city || !postal_code) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const addressId = await addressModel.createAddress({
      user_id: userId,
      phone,
      address,
      city,
      postal_code
    });
    res.status(201).json({ message: 'Address created successfully', addressId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
}

exports.getAddressById = async (req, res) => {
  const addressId = req.params.id;
  const userId = req.userId;

  try {
    const address = await addressModel.getAddressById(addressId);
    if (!address)return res.status(404).json({ message: 'Address not found' });
    
    if (address.user_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to view this address' });
    }

    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching address', error: error.message });
  }
}

exports.getAddressesByUser = async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.userId;

  if (parseInt(userId) !== requesterId) {
    return res.status(403).json({ message: 'You do not have permission to view these addresses' });
  }

  try {
    const addresses = await addressModel.getAddressesByUserId(userId);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
}

exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const { phone, address, city, postal_code } = req.body;
  const userId = req.userId;
  
  try {
    const existingAddress = await addressModel.getAddressById(id);
    if (!existingAddress) return res.status(404).json({ message: 'Address not found' });
    
    if (existingAddress.user_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this address' });
    }

    const updated = await addressModel.updateAddress(id, {
      phone,
      address,
      city,
      postal_code
    });
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update address' });
    }

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const existingAddress = await addressModel.getAddressById(id);
    if (!existingAddress) return res.status(404).json({ message: 'Address not found' });
    
    if (existingAddress.user_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this address' });
    }

    const deleted = await addressModel.deleteAddress(id);
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete address' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
}