// Dummy responses for Jante ch-Ai chatbot
const chatResponses = {
    // Greetings
    greetings: [
        "Hello! I'm Jante ch-Ai, your AI assistant for government information in Bangladesh. How can I help you today?",
        "Hi there! Welcome to Jante ch-Ai. I'm here to help you with any questions about government services. What would you like to know?",
        "Greetings! I'm your AI-powered government information assistant. Feel free to ask me anything about NID, licenses, taxes, or other government services."
    ],

    // NID related responses
    nid: [
        "For National ID (NID) services:\n\n📋 **Required Documents:**\n• Birth Certificate\n• Passport-size photographs\n• Proof of address\n\n🏢 **Where to Apply:**\n• Local Upazila/Thana offices\n• District Registrar offices\n• Online through ec.gov.bd\n\n💰 **Fees:**\n• First-time: 125 BDT\n• Correction: 230 BDT\n• Duplicate: 345 BDT\n\nWould you like specific information about any of these?",
        "NID correction process:\n\n1️⃣ **Online Application:** Visit ec.gov.bd\n2️⃣ **Fill Form:** Complete the correction form\n3️⃣ **Upload Documents:** Supporting documents for correction\n4️⃣ **Pay Fee:** 230 BDT online payment\n5️⃣ **Verification:** Wait for verification (7-15 days)\n6️⃣ **Collection:** Collect from designated center\n\nNeed help with any specific step?",
        "Smart NID card features:\n\n🔒 **Security Features:**\n• Biometric data storage\n• Digital signature\n• Encrypted information\n\n💳 **Uses:**\n• Government service access\n• Banking and financial services\n• Digital identity verification\n• Online service authentication\n\nWhat specific aspect would you like to know more about?"
    ],

    // Driving License responses
    license: [
        "Driving License application process:\n\n📝 **Steps:**\n1️⃣ Medical certificate from authorized doctor\n2️⃣ Driving training from approved center\n3️⃣ Theory test (pass mark: 60%)\n4️⃣ Practical driving test\n5️⃣ Final approval and fee payment\n\n💰 **Fees:**\n• Professional: 2,100 BDT\n• Non-professional: 1,100 BDT\n\n📍 **Where:** BRTA offices nationwide\n\nNeed details about any specific step?",
        "Required documents for driving license:\n\n📄 **Essential Documents:**\n• National ID card (photocopy)\n• Medical certificate (valid 6 months)\n• Training certificate from approved center\n• Passport-size photographs (3 copies)\n• Previous license (for renewal)\n\n🔍 **Additional for Professional:**\n• Character certificate\n• Educational certificate\n\nWhich document do you need more information about?",
        "Driving license renewal process:\n\n⏰ **Renewal Timeline:**\n• Apply 30 days before expiry\n• Grace period: 60 days after expiry\n• Late renewal: Additional fine\n\n💰 **Renewal Fees:**\n• Professional: 1,000 BDT\n• Non-professional: 500 BDT\n• Late fee: 100 BDT per month\n\n📱 **Online Renewal:** Available through BRTA website\n\nWould you like help with online renewal?"
    ],

    // Tax related responses
    tax: [
        "Income Tax in Bangladesh:\n\n📊 **Tax Rates (FY 2023-24):**\n• Up to 3,50,000 BDT: 0%\n• 3,50,001 - 4,50,000: 5%\n• 4,50,001 - 7,50,000: 10%\n• 7,50,001 - 11,50,000: 15%\n• 11,50,001 - 16,50,000: 20%\n• Above 16,50,000: 25%\n\n📅 **Return Filing:** July 1 - November 30\n💰 **Minimum Tax:** 5,000 BDT for companies\n\nNeed help calculating your tax?",
        "TIN (Tax Identification Number) registration:\n\n📝 **How to Apply:**\n1️⃣ Visit NBR website or tax office\n2️⃣ Fill TIN application form\n3️⃣ Submit required documents\n4️⃣ Pay registration fee (0 BDT - it's free!)\n5️⃣ Receive TIN certificate\n\n📄 **Required Documents:**\n• National ID card\n• Passport-size photograph\n• Proof of address\n\n🌐 **Online:** Available at secure.incometax.gov.bd\n\nWant help with online TIN registration?",
        "VAT (Value Added Tax) information:\n\n📊 **Standard VAT Rate:** 15%\n🏭 **VAT Registration:** Required if annual turnover > 30 lakh BDT\n📅 **VAT Return:** Monthly (by 15th of next month)\n\n🛍️ **VAT Exemptions:**\n• Basic food items\n• Educational materials\n• Medical equipment\n• Agricultural products\n\n💼 **For Businesses:**\n• VAT certificate required\n• Proper record keeping mandatory\n\nNeed specific VAT guidance for your business?"
    ],

    // Passport responses
    passport: [
        "Passport application process:\n\n📝 **Steps:**\n1️⃣ Online application at www.passport.gov.bd\n2️⃣ Fill personal information\n3️⃣ Upload photograph and signature\n4️⃣ Pay fee online\n5️⃣ Appointment booking\n6️⃣ Visit passport office with documents\n7️⃣ Biometric data collection\n8️⃣ Passport collection\n\n💰 **Fees:**\n• Regular (10 working days): 3,000 BDT\n• Express (7 working days): 5,000 BDT\n• Super Express (3 working days): 7,500 BDT\n\nWhich type of service do you need?",
        "Required documents for passport:\n\n📄 **Essential Documents:**\n• Online application copy\n• National ID card (original + photocopy)\n• Birth certificate (original + photocopy)\n• SSC/equivalent certificate\n• Fee payment receipt\n\n👔 **For Minors (under 18):**\n• Parents' consent letter\n• Parents' NID copies\n• Birth certificate with parents' names\n\n🔄 **For Renewal:**\n• Old passport (if available)\n• All pages photocopy of old passport\n\nNeed help with document preparation?",
        "Passport renewal and reissuance:\n\n🔄 **Renewal Process:**\n• Same as new application\n• Must surrender old passport\n• Additional verification may be required\n\n📋 **Reissuance (Lost/Damaged):**\n1️⃣ Police report (for lost passport)\n2️⃣ Newspaper advertisement\n3️⃣ Affidavit from magistrate\n4️⃣ Follow regular application process\n\n⏰ **Processing Time:**\n• Regular: 10 working days\n• Express: 7 working days\n• Emergency: 3 working days\n\nWhich service do you need guidance for?"
    ],

    // General government services
    general: [
        "I can help you with various government services in Bangladesh:\n\n🆔 **Identity Services:**\n• National ID (NID)\n• Birth/Death certificates\n• Citizenship certificates\n\n🚗 **Transport Services:**\n• Driving license\n• Vehicle registration\n• Route permits\n\n💼 **Business Services:**\n• Trade license\n• TIN registration\n• VAT registration\n\n🎓 **Education Services:**\n• Certificate verification\n• Scholarship information\n\n💰 **Tax Services:**\n• Income tax\n• VAT\n• Property tax\n\nWhat specific service interests you?",
        "Digital Bangladesh services available online:\n\n🌐 **Popular Digital Services:**\n• e-Passport application\n• Online TIN registration\n• Digital birth certificate\n• Online tax return filing\n• e-GP (Government Procurement)\n• National Portal services\n\n📱 **Access Points:**\n• Government websites\n• Digital centers\n• Mobile apps\n• SMS services\n\n🔐 **Digital Security:**\n• OTP verification\n• Digital signatures\n• Secure payment gateways\n\nWhich digital service would you like to explore?",
        "Emergency government contacts:\n\n🚨 **Emergency Numbers:**\n• National Emergency: 999\n• Police: 999\n• Fire Service: 199\n• Ambulance: 199\n\n📞 **Government Helplines:**\n• Information Commission: 16263\n• Anti-Corruption: 106\n• Consumer Rights: 16430\n• Women & Children: 109\n\n🏢 **Key Government Offices:**\n• Prime Minister's Office: +880-2-7160000\n• Cabinet Division: +880-2-7161201\n• NBR: +880-2-9143092\n\nNeed any specific contact information?"
    ],

    // Default responses for unrecognized queries
    default: [
        "I understand you're looking for government information. Could you please be more specific? For example, you can ask about:\n\n• National ID (NID) services\n• Driving license procedures\n• Tax information and TIN\n• Passport applications\n• Business licenses\n• Education certificates\n\nWhat specific service would you like to know about?",
        "I'm here to help with Bangladesh government services! I can provide information about:\n\n📋 Documents and certificates\n💰 Tax and financial services\n🚗 Transport and licensing\n🏛️ General government procedures\n\nPlease let me know what specific information you need, and I'll do my best to help!",
        "I'd be happy to help you with government information! Here are some topics I can assist with:\n\n• Application procedures\n• Required documents\n• Fees and payments\n• Processing times\n• Office locations\n• Online services\n\nWhat would you like to know more about?"
    ]
};

// Function to get appropriate response based on user input
function getResponse(userInput) {
    const input = userInput.toLowerCase();
    
    // Check for greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || 
        input.includes('good morning') || input.includes('good afternoon') || 
        input.includes('good evening') || input.includes('assalam') || input.includes('adab')) {
        return getRandomResponse(chatResponses.greetings);
    }
    
    // Check for NID related queries
    if (input.includes('nid') || input.includes('national id') || input.includes('identity card') ||
        input.includes('voter id') || input.includes('smart card')) {
        return getRandomResponse(chatResponses.nid);
    }
    
    // Check for driving license queries
    if (input.includes('driving') || input.includes('license') || input.includes('brta') ||
        input.includes('car') || input.includes('vehicle') || input.includes('drive')) {
        return getRandomResponse(chatResponses.license);
    }
    
    // Check for tax related queries
    if (input.includes('tax') || input.includes('tin') || input.includes('vat') || 
        input.includes('income') || input.includes('return') || input.includes('nbr')) {
        return getRandomResponse(chatResponses.tax);
    }
    
    // Check for passport queries
    if (input.includes('passport') || input.includes('travel') || input.includes('visa') ||
        input.includes('international')) {
        return getRandomResponse(chatResponses.passport);
    }
    
    // Check for general government service queries
    if (input.includes('government') || input.includes('service') || input.includes('digital bangladesh') ||
        input.includes('online') || input.includes('help') || input.includes('information')) {
        return getRandomResponse(chatResponses.general);
    }
    
    // Default response for unrecognized queries
    return getRandomResponse(chatResponses.default);
}

// Helper function to get random response from array
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Export for use in chat.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getResponse };
}
