const { analyzeCompositeBurnout } = require('../services/burnoutService');
const { predictBurnout } = require('../services/burnoutPredictor');

/**
 * @desc    Get comprehensive wellness and burnout summary
 * @route   GET /api/wellness/summary
 * @access  Private
 */
const getBurnoutStatus = async (req, res) => {
    try {
        // Note: In a real app, we might pass actual focus stats here.
        // For now, we call the composite analyzer.
        const summary = await analyzeCompositeBurnout(req.user._id);
        res.json(summary);
    } catch (error) {
        console.error('Error in getBurnoutStatus:', error);
        res.status(500).json({ message: 'Error fetching wellness summary' });
    }
};

/**
 * @desc    Get AI-predicted burnout risk with factors
 * @route   GET /api/wellness/burnout-risk
 * @access  Private
 */
const getBurnoutRisk = async (req, res) => {
    try {
        const userId = req.user._id;
        const riskData = await predictBurnout(userId);
        res.json(riskData);
    } catch (error) {
        console.error('Error in getBurnoutRisk:', error);
        res.status(500).json({ message: 'Error calculating burnout risk' });
    }
};

module.exports = { 
    getBurnoutStatus, 
    getBurnoutRisk 
};
