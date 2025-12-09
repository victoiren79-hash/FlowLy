// At the top of dashboard.js, make sure you have:
const supabaseUrl = 'https://wkcbggxtmwttdjxtoieh.supabase.co';
const supabaseKey = 'sb_publishable_SkNcPG8vCj2xB-KORM4_tQ_Q2_MlBwe';

// EmailJS Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const EMAILJS_CONFIG = {
    serviceId: 'default_service', // Usually 'default_service' if you have one email service
    templateId: 'template_4agrj1a', // Get this from EmailJS Templates
    userId: 'ViKEF4HrhrIGcmkfK' // Get this from EmailJS Account → API Keys
};

let supabaseClient;

// Wait for Supabase to load
document.addEventListener('DOMContentLoaded', () => {
    // Load Supabase from CDN if not already loaded
    if (typeof window.supabase === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            initializeSupabase();
        };
        script.onerror = () => {
            console.error('Failed to load Supabase');
            showErrorOnPage('Failed to load authentication system. Please refresh.');
        };
        document.head.appendChild(script);
    } else {
        initializeSupabase();
    }
});

function initializeSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Dashboard: Supabase initialized');
        initializeDashboard();
    } else {
        console.error('❌ Dashboard: Supabase not loaded');
        showErrorOnPage('Authentication system not ready. Please refresh.');
    }
}

// Show error directly on page instead of redirecting
function showErrorOnPage(message) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2>Authentication Required</h2>
                <p>${message}</p>
                <div style="margin-top: 30px;">
                    <a href="index.html" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
                        Go to Login
                    </a>
                </div>
            </div>
        `;
    }
}

// Add CSS styles for action buttons, animations, and dialogs
const actionStyles = `
.transaction-item {
    position: relative;
    transition: all 0.3s ease;
    overflow: visible;
    padding-right: 80px;
}

.transaction-item:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
}

.transaction-actions {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: all 0.3s ease;
}

.transaction-item:hover .transaction-actions {
    opacity: 1;
}

.action-btn {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
}

.action-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.delete-btn:hover {
    background: #fee2e2;
    border-color: #ef4444;
}

.transaction-item:hover .transaction-amount {
    opacity: 0;
}

.transaction-amount {
    transition: opacity 0.3s ease;
}

.quick-update {
    animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(0.98); }
}

/* Loading system */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(3px);
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
}

.loading-overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(243, 244, 246, 0.3);
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.success-checkmark {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #10b981;
    position: relative;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    animation: checkmark-appear 0.3s ease-out;
}

@keyframes checkmark-appear {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.success-checkmark::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 30px;
    font-weight: bold;
}

.loading-text {
    color: white;
    margin-top: 20px;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    max-width: 300px;
    line-height: 1.5;
}

.loading-details {
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
}

/* Dialog Boxes */
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.dialog-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.dialog-box {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
    transform: translateY(20px) scale(0.95);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
}

.dialog-overlay.active .dialog-box {
    transform: translateY(0) scale(1);
    opacity: 1;
}

.dialog-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 12px;
}

.dialog-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.dialog-icon.success {
    background: #d1fae5;
    color: #10b981;
}

.dialog-icon.warning {
    background: #fef3c7;
    color: #f59e0b;
}

.dialog-icon.danger {
    background: #fee2e2;
    color: #ef4444;
}

.dialog-icon.info {
    background: #dbeafe;
    color: #2563eb;
}

.dialog-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.dialog-content {
    padding: 20px 24px;
    color: #6b7280;
    line-height: 1.5;
    font-size: 15px;
}

.dialog-actions {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    border-top: 1px solid #f3f4f6;
}

.dialog-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.dialog-btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.dialog-btn-secondary:hover {
    background: #e5e7eb;
}

.dialog-btn-primary {
    background: #2563eb;
    color: white;
}

.dialog-btn-primary:hover {
    background: #1d4ed8;
}

.dialog-btn-danger {
    background: #dc2626;
    color: white;
}

.dialog-btn-danger:hover {
    background: #b91c1c;
}

.dialog-btn-success {
    background: #10b981;
    color: white;
}

.dialog-btn-success:hover {
    background: #0d966d;
}

.timeline-fill {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Cash Health Label Styles */
.cash-health-label {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-left: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cash-health-critical {
    background: #fee2e2;
    color: #dc2626;
}

.cash-health-low {
    background: #fef3c7;
    color: #d97706;
}

.cash-health-moderate {
    background: #dbeafe;
    color: #2563eb;
}

.cash-health-stable {
    background: #d1fae5;
    color: #059669;
}

.cash-health-growing {
    background: #d1fae5;
    color: #10b981;
}

.cash-health-neutral {
    background: #f3f4f6;
    color: #6b7280;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 4px;
}

.modal-close:hover {
    background: #f3f4f6;
}

.modal-body {
    margin-bottom: 24px;
}

.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
}

.form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    background: white;
}

.form-select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-primary {
    background: #2563eb;
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

/* Alert Section */
.alert-section {
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.alert-icon {
    width: 40px;
    height: 40px;
    background: #2563eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
}

.alert-text {
    flex: 1;
    font-size: 14px;
    color: #1e40af;
}

.alert-button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
}

.alert-button:hover {
    background: #1d4ed8;
}

/* Global button styles */
.btn-add {
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 0;
}

.btn-add:hover {
    background: #0d966d;
}
`;

// Add the action styles to the document
const actionStyleSheet = document.createElement('style');
actionStyleSheet.textContent = actionStyles;
document.head.appendChild(actionStyleSheet);

// Loading system
let currentLoadingTimeout = null;

function showLoading(message = 'Loading...', details = '') {
    if (currentLoadingTimeout) {
        clearTimeout(currentLoadingTimeout);
        currentLoadingTimeout = null;
    }
    
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'globalLoadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
        ${details ? `<div class="loading-details">${details}</div>` : ''}
    `;
    document.body.appendChild(loadingOverlay);
}

function showSuccess(message = 'Success!') {
    const loadingOverlay = document.getElementById('globalLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div class="success-checkmark"></div>
            <div class="loading-text">${message}</div>
        `;
        
        currentLoadingTimeout = setTimeout(() => {
            hideLoading();
        }, 1000);
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('globalLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 300);
    }
    
    if (currentLoadingTimeout) {
        clearTimeout(currentLoadingTimeout);
        currentLoadingTimeout = null;
    }
}

// Dialog System
function showDialog(options) {
    const {
        type = 'info',
        title = 'Notification',
        message = '',
        icon = '',
        confirmText = 'OK',
        cancelText = 'Cancel',
        onConfirm = null,
        onCancel = null,
        showCancel = true
    } = options;
    
    hideDialog();
    
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.id = 'globalDialogOverlay';
    
    let dialogIcon = icon;
    if (!icon) {
        switch(type) {
            case 'success': dialogIcon = '✓'; break;
            case 'warning': dialogIcon = '⚠️'; break;
            case 'danger': dialogIcon = '🗑️'; break;
            case 'info': dialogIcon = 'ℹ️'; break;
            default: dialogIcon = 'ℹ️';
        }
    }
    
    dialogOverlay.innerHTML = `
        <div class="dialog-box">
            <div class="dialog-header">
                <div class="dialog-icon ${type}">${dialogIcon}</div>
                <h3 class="dialog-title">${title}</h3>
            </div>
            <div class="dialog-content">${message}</div>
            <div class="dialog-actions">
                ${showCancel ? `<button class="dialog-btn dialog-btn-secondary" id="dialogCancelBtn">${cancelText}</button>` : ''}
                <button class="dialog-btn dialog-btn-${type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'primary'}" id="dialogConfirmBtn">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialogOverlay);
    
    setTimeout(() => {
        dialogOverlay.classList.add('active');
    }, 10);
    
    const confirmBtn = document.getElementById('dialogConfirmBtn');
    const cancelBtn = document.getElementById('dialogCancelBtn');
    
    const closeDialog = () => {
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
            if (dialogOverlay.parentNode) {
                dialogOverlay.parentNode.removeChild(dialogOverlay);
            }
        }, 300);
    };
    
    confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        closeDialog();
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            closeDialog();
        });
    }
    
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            if (onCancel) onCancel();
            closeDialog();
        }
    });
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (onCancel) onCancel();
            closeDialog();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function hideDialog() {
    const dialogOverlay = document.getElementById('globalDialogOverlay');
    if (dialogOverlay) {
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
            if (dialogOverlay.parentNode) {
                dialogOverlay.parentNode.removeChild(dialogOverlay);
            }
        }, 300);
    }
}

function showSuccessDialog(title, message) {
    showDialog({
        type: 'success',
        title: title,
        message: message,
        confirmText: 'Got it!',
        showCancel: false
    });
}

function showDeleteConfirmation(itemName, itemType, onDelete) {
    showDialog({
        type: 'danger',
        title: `Delete ${itemType}`,
        message: `Are you sure you want to delete <strong>"${itemName}"</strong>? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep it',
        onConfirm: onDelete
    });
}

function showAddSuccessDialog(itemName, itemType) {
    showDialog({
        type: 'success',
        title: `${itemType} Added`,
        message: `"${itemName}" has been successfully added to your ${itemType.toLowerCase()}!`,
        confirmText: 'Awesome!',
        showCancel: false
    });
}

function showUpdateSuccessDialog(itemName, itemType) {
    showDialog({
        type: 'success',
        title: `${itemType} Updated`,
        message: `"${itemName}" has been successfully updated!`,
        confirmText: 'Great!',
        showCancel: false
    });
}

function showErrorDialog(title, message) {
    showDialog({
        type: 'danger',
        title: title,
        message: message,
        confirmText: 'Try Again',
        showCancel: false
    });
}

// Load and display real data from onboarding
async function loadDashboardData() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            console.log('No user found in loadDashboardData');
            hideLoading();
            showErrorOnPage('Please sign in to view your dashboard.');
            return;
        }

        const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error loading profile:', error);
            hideLoading();
            
            // If profile doesn't exist, show onboarding link
            if (error.code === 'PGRST116') {
                showErrorOnPage('Please complete onboarding first.');
                return;
            }
            
            showErrorDialog('Error Loading Dashboard', 'Failed to load your financial data. Please try again.');
            return;
        }

        // Extract currency from profile (default to USD if not set)
        const currency = profile.currency || 'USD';
        
        setTimeout(() => {
            // Pass currency to update function
            updateDashboardWithRealData(profile, currency, user);
            hideLoading();
        }, 500);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        hideLoading();
        showErrorDialog('Error', 'An error occurred while loading your dashboard. Please refresh the page.');
    }
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS - FIXED VERSION
// ============================================

// Initialize EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.userId);
        console.log('✅ EmailJS initialized');
    } else {
        console.log('⚠️ EmailJS not loaded yet');
    }
}

// Send low balance email
async function sendLowBalanceEmail(userEmail, userName, balance, threshold, currency) {
    try {
        // Initialize EmailJS
        initEmailJS();
        
        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Prepare email data
        const templateParams = {
            name: userName || 'User',
            balance: formatCurrency(balance, currency),
            threshold: formatCurrency(threshold, currency),
            dashboard_url: window.location.origin + '/dashboard.html',
            to_email: userEmail  // This tells EmailJS who to send to
        };
        
        console.log('📧 Sending LOW BALANCE email with:', templateParams);
        
        // Send email
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        console.log('✅ Low balance email sent successfully:', response.status);
        return true;
        
    } catch (error) {
        console.error('❌ Low balance email failed:', error);
        return false;
    }
}

// Check and send low balance notification - FIXED VERSION
async function checkAndSendLowBalanceNotification(profile, currency, user) {
    const LOW_BALANCE_THRESHOLD = 1000; // $1000 threshold
    
    // Debug: Log current values
    console.log('🔍 Checking low balance notification:');
    console.log('  - Current balance:', profile.current_balance);
    console.log('  - Threshold:', LOW_BALANCE_THRESHOLD);
    console.log('  - Condition (balance < threshold?):', profile.current_balance < LOW_BALANCE_THRESHOLD);
    
    // FIX: Ensure balance is a number and compare correctly
    const currentBalance = parseFloat(profile.current_balance) || 0;
    
    // ONLY send if balance is BELOW the threshold
    if (currentBalance < LOW_BALANCE_THRESHOLD) {
        console.log('⚠️ Low balance detected!');
        
        // Check if we sent this recently (using localStorage)
        const lastSentKey = `lastLowBalanceEmail_${user.id}`;
        const lastSent = localStorage.getItem(lastSentKey);
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        if (!lastSent || parseInt(lastSent) < twentyFourHoursAgo) {
            console.log('📧 Sending low balance email...');
            const sent = await sendLowBalanceEmail(
                user.email,
                user.user_metadata?.name || user.email,
                currentBalance,
                LOW_BALANCE_THRESHOLD,
                currency
            );
            
            if (sent) {
                localStorage.setItem(lastSentKey, Date.now().toString());
                console.log('✅ Low balance email sent to:', user.email);
                return true;
            }
        } else {
            console.log('⏰ Low balance email already sent recently');
        }
    } else {
        console.log('✅ Balance is above threshold, no email needed');
    }
    
    return false;
}

// Check and send shortfall notification
async function checkAndSendShortfallNotification(profile, currency, user) {
    const totalIncome = profile.income_sources?.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0) || 0;
    const totalExpenses = profile.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0;
    const monthlyNetCashFlow = totalIncome - totalExpenses;
    const weeklyNetCashFlow = monthlyNetCashFlow / 4.33;
    const currentBalance = parseFloat(profile.current_balance) || 0;
    
    // ONLY send if we have NEGATIVE cash flow (burning cash)
    if (weeklyNetCashFlow < 0) {
        const daysToShortfall = Math.abs(currentBalance / (weeklyNetCashFlow / 7));
        
        // Only alert if shortfall within 14 days
        if (daysToShortfall <= 14) {
            console.log('⚠️ Shortfall detected! Days to shortfall:', daysToShortfall);
            
            const lastSentKey = `lastShortfallEmail_${user.id}`;
            const lastSent = localStorage.getItem(lastSentKey);
            const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
            
            if (!lastSent || parseInt(lastSent) < twelveHoursAgo) {
                console.log('📧 Sending shortfall email...');
                
                // Use a different template for shortfall if available, otherwise use same template
                const templateParams = {
                    name: user.user_metadata?.name || user.email,
                    balance: formatCurrency(currentBalance, currency),
                    threshold: `${Math.ceil(daysToShortfall)} days`,
                    dashboard_url: window.location.origin + '/dashboard.html',
                    to_email: user.email,
                    warning_type: 'cash_shortfall'
                };
                
                try {
                    initEmailJS();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const response = await emailjs.send(
                        EMAILJS_CONFIG.serviceId,
                        EMAILJS_CONFIG.templateId,
                        templateParams
                    );
                    
                    if (response.status === 200) {
                        localStorage.setItem(lastSentKey, Date.now().toString());
                        console.log('✅ Shortfall email sent to:', user.email);
                        return true;
                    }
                } catch (error) {
                    console.error('❌ Shortfall email failed:', error);
                }
            } else {
                console.log('⏰ Shortfall email already sent recently');
            }
        }
    }
    
    return false;
}

// Check and send weekly summary (runs every Monday)
async function checkAndSendWeeklySummary(profile, currency, user) {
    // Only send on Mondays
    const today = new Date();
    if (today.getDay() !== 1) {
        console.log('📅 Not Monday, skipping weekly summary');
        return false; // 0 = Sunday, 1 = Monday
    }
    
    console.log('📅 Monday detected, checking weekly summary...');
    
    // Check if we already sent this week
    const lastSentKey = `lastWeeklySummary_${user.id}`;
    const lastSent = localStorage.getItem(lastSentKey);
    const thisMonday = getStartOfWeek();
    
    if (lastSent && parseInt(lastSent) >= thisMonday.getTime()) {
        console.log('⏰ Weekly summary already sent this week');
        return false; // Already sent this week
    }
    
    const totalIncome = profile.income_sources?.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0) || 0;
    const totalExpenses = profile.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0;
    const monthlyNetCashFlow = totalIncome - totalExpenses;
    const weeklyNetCashFlow = monthlyNetCashFlow / 4.33;
    const currentBalance = parseFloat(profile.current_balance) || 0;
    
    // Send weekly summary
    const templateParams = {
        name: user.user_metadata?.name || user.email,
        balance: formatCurrency(currentBalance, currency),
        income: formatCurrency(totalIncome, currency),
        expenses: formatCurrency(totalExpenses, currency),
        net_cash_flow: formatCurrency(monthlyNetCashFlow, currency),
        weekly_cash_flow: formatCurrency(weeklyNetCashFlow, currency),
        dashboard_url: window.location.origin + '/dashboard.html',
        to_email: user.email,
        week_start: today.toLocaleDateString(),
        week_end: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
    
    try {
        initEmailJS();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('📧 Sending weekly summary email...');
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            localStorage.setItem(lastSentKey, Date.now().toString());
            console.log('✅ Weekly summary email sent to:', user.email);
            return true;
        }
    } catch (error) {
        console.error('❌ Weekly summary email failed:', error);
    }
    
    return false;
}

// Main notification check function
async function checkAllNotifications(profile, currency, user) {
    console.log('🔔 Starting notification checks...');
    
    try {
        // Check low balance
        await checkAndSendLowBalanceNotification(profile, currency, user);
        
        // Check shortfall
        await checkAndSendShortfallNotification(profile, currency, user);
        
        // Check weekly summary
        await checkAndSendWeeklySummary(profile, currency, user);
        
        console.log('✅ All notification checks completed');
        
    } catch (error) {
        console.error('❌ Error checking notifications:', error);
    }
}

// Helper function to get start of week (Monday)
function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

// Test email function
window.testEmail = async function() {
    console.log('🔄 Testing email...');
    
    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        alert('Please login first');
        return;
    }
    
    // Test with dummy data
    const templateParams = {
        name: user.user_metadata?.name || 'Test User',
        balance: formatCurrency(500, 'USD'),
        threshold: formatCurrency(1000, 'USD'),
        dashboard_url: window.location.origin + '/dashboard.html',
        to_email: user.email
    };
    
    try {
        initEmailJS();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            alert('✅ Test email sent! Check your inbox (and spam folder)');
        } else {
            alert('❌ Failed to send email. Check console for errors.');
        }
    } catch (error) {
        console.error('Test email failed:', error);
        alert('❌ Email failed: ' + (error.text || error.message));
    }
};

// Test low balance notification
window.testLowBalance = async function() {
    console.log('🔄 Testing low balance notification...');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert('Please login first');
        return;
    }
    
    const { data: profile } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (profile) {
        // Temporarily set low balance for testing
        const testProfile = { ...profile, current_balance: 500 };
        const currency = profile.currency || 'USD';
        
        await checkAndSendLowBalanceNotification(testProfile, currency, user);
        alert('Test completed. Check console for details.');
    }
};

// ============================================
// END EMAIL NOTIFICATION FUNCTIONS
// ============================================

// Update function signature to accept currency and user parameters
function updateDashboardWithRealData(profile, currency, user) {
    if (!profile) {
        showErrorDialog('No Data Found', 'No profile data found. Please complete the onboarding process.');
        return;
    }

    // 1. RECALCULATE BURN RATE FROM REAL DATA
    const totalIncome = profile.income_sources?.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0) || 0;
    const totalExpenses = profile.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0;
    const monthlyBurnRate = totalExpenses;
    const monthlyNetCashFlow = totalIncome - totalExpenses;
    const weeklyBurnRate = monthlyBurnRate / 4.33; // Average weeks per month
    const weeklyNetCashFlow = monthlyNetCashFlow / 4.33;

    const balanceElement = document.querySelector('.balance-amount');
    const burnRateElement = document.querySelector('.burn-rate');
    
    if (balanceElement) balanceElement.textContent = formatCurrency(profile.current_balance, currency);
    
    // 2. USE THAT BURN RATE IN FORECAST + RUNWAY
    // 3. ALWAYS SHOW UNITS (monthly and weekly)
    if (burnRateElement) {
        burnRateElement.innerHTML = `
            <div>${formatCurrency(monthlyBurnRate, currency)} <span style="color: #6b7280; font-size: 0.9em">/month</span></div>
            <div style="font-size: 0.9em; color: #6b7280;">(${formatCurrency(weeklyBurnRate, currency)}/week)</div>
        `;
    }

    // 4-6. All features integrated into forecast function
    updateEnhancedForecast(profile.current_balance, totalIncome, totalExpenses, monthlyBurnRate, weeklyBurnRate, monthlyNetCashFlow, weeklyNetCashFlow, currency);
    updateEnhancedTimelineBar(profile.current_balance, monthlyBurnRate, monthlyNetCashFlow);
    updateMoneyInSection(profile.income_sources, currency, totalIncome);
    updateMoneyOutSection(profile.expenses, currency, totalExpenses);
    updateAlertsSection(profile.invoices, currency, profile.current_balance, monthlyBurnRate, totalIncome, monthlyNetCashFlow);
    
    // 7. Check and send notifications (after dashboard loads)
    setTimeout(async () => {
        await checkAllNotifications(profile, currency, user);
    }, 3000); // Wait 3 seconds after dashboard loads
}

function updateEnhancedForecast(currentBalance, totalIncome, totalExpenses, monthlyBurnRate, weeklyBurnRate, monthlyNetCashFlow, weeklyNetCashFlow, currency) {
    const forecastElement = document.querySelector('.forecast-insight .insight-text');
    if (!forecastElement) return;

    // 2. USE THAT BURN RATE IN FORECAST + RUNWAY
    let weeksOfRunway = 0;
    let cashHealthLabel = '';
    let cashHealthClass = '';
    let recommendation = '';
    let statusIcon = '📊';
    
    if (weeklyNetCashFlow < 0) {
        // Burning cash
        weeksOfRunway = currentBalance / Math.abs(weeklyNetCashFlow);
        
        if (weeksOfRunway < 2) {
            cashHealthLabel = 'CRITICAL';
            cashHealthClass = 'cash-health-critical';
            recommendation = '🚨 Immediate action required!';
            statusIcon = '🚨';
        } else if (weeksOfRunway < 4) {
            cashHealthLabel = 'LOW';
            cashHealthClass = 'cash-health-low';
            recommendation = '⚠️ Consider reducing expenses.';
            statusIcon = '⚠️';
        } else if (weeksOfRunway < 8) {
            cashHealthLabel = 'MODERATE';
            cashHealthClass = 'cash-health-moderate';
            recommendation = 'Monitor expenses closely.';
            statusIcon = '📉';
        } else {
            cashHealthLabel = 'STABLE';
            cashHealthClass = 'cash-health-stable';
            recommendation = 'Maintain current trajectory.';
            statusIcon = '📊';
        }
    } else if (weeklyNetCashFlow > 0) {
        // Growing cash
        weeksOfRunway = Infinity;
        cashHealthLabel = 'GROWING';
        cashHealthClass = 'cash-health-growing';
        recommendation = 'Consider reinvesting profits.';
        statusIcon = '📈';
    } else {
        // Break-even
        weeksOfRunway = Infinity;
        cashHealthLabel = 'NEUTRAL';
        cashHealthClass = 'cash-health-neutral';
        recommendation = 'Look for growth opportunities.';
        statusIcon = '⚖️';
    }

    // 4. USE A CLEAN INSIGHT TEXT TEMPLATE
    let forecastMessage = '';
    
    if (weeklyNetCashFlow < 0) {
        forecastMessage = `
            ${statusIcon} <span class="insight-highlight">Burn Analysis:</span> 
            <span class="${cashHealthClass}" style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 5px;">${cashHealthLabel}</span><br>
            
            • <strong>Current burn:</strong> ${formatCurrency(weeklyBurnRate, currency)}/week 
            (<span style="color: #ef4444;">↓${formatCurrency(Math.abs(weeklyNetCashFlow), currency)} net</span>)<br>
            
            • <strong>Runway:</strong> <span class="insight-highlight">${weeksOfRunway === Infinity ? '∞' : weeksOfRunway.toFixed(1)} weeks</span><br>
            
            • <strong>3-week forecast:</strong> ${formatCurrency(Math.max(0, currentBalance + (weeklyNetCashFlow * 3)), currency)} 
            (<span style="color: #ef4444;">↓${formatCurrency(Math.abs(weeklyNetCashFlow * 3), currency)} decrease</span>)<br>
            
            <span style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #fef3c7; border-radius: 6px; font-size: 12px;">
                💡 <strong>Recommendation:</strong> ${recommendation}
            </span>
        `;
    } else if (weeklyNetCashFlow > 0) {
        const growthAmount = weeklyNetCashFlow * 3;
        forecastMessage = `
            ${statusIcon} <span class="insight-highlight">Growth Analysis:</span> 
            <span class="${cashHealthClass}" style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 5px;">${cashHealthLabel}</span><br>
            
            • <strong>Weekly growth:</strong> ${formatCurrency(weeklyNetCashFlow, currency)}/week 
            (<span style="color: #10b981;">↑ Positive cash flow</span>)<br>
            
            • <strong>Runway:</strong> <span class="insight-highlight" style="color: #10b981;">∞ weeks</span> (sustainable)<br>
            
            • <strong>3-week forecast:</strong> ${formatCurrency(currentBalance + growthAmount, currency)} 
            (<span style="color: #10b981;">↑${formatCurrency(growthAmount, currency)} increase</span>)<br>
            
            <span style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #d1fae5; border-radius: 6px; font-size: 12px;">
                💡 <strong>Recommendation:</strong> ${recommendation}
            </span>
        `;
    } else {
        forecastMessage = `
            ${statusIcon} <span class="insight-highlight">Stability Analysis:</span> 
            <span class="${cashHealthClass}" style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 5px;">${cashHealthLabel}</span><br>
            
            • <strong>Weekly cash flow:</strong> ${formatCurrency(weeklyNetCashFlow, currency)}/week 
            (<span style="color: #6b7280;">⚖️ Break-even</span>)<br>
            
            • <strong>Runway:</strong> <span class="insight-highlight">Maintained</span><br>
            
            • <strong>3-week forecast:</strong> ${formatCurrency(currentBalance, currency)} 
            (no change expected)<br>
            
            <span style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 12px;">
                💡 <strong>Recommendation:</strong> ${recommendation}
            </span>
        `;
    }

    forecastElement.innerHTML = forecastMessage;
}

function updateEnhancedTimelineBar(currentBalance, monthlyBurnRate, monthlyNetCashFlow) {
    const timelineFill = document.querySelector('.timeline-fill');
    if (!timelineFill) return;

    const weeklyNetCashFlow = monthlyNetCashFlow / 4.33; // Average weeks per month
    
    // Calculate weeks of runway before cash runs out
    let weeksOfRunway = 0;
    let timelineWidth = 100;
    let gradient = '';
    
    if (weeklyNetCashFlow < 0) {
        // Burning cash - calculate weeks until cash runs out
        weeksOfRunway = currentBalance / Math.abs(weeklyNetCashFlow);
        
        // Map weeks of runway to timeline width (max 12 weeks shown)
        const maxWeeksToShow = 12;
        if (weeksOfRunway <= maxWeeksToShow) {
            // Convert weeks to percentage (100% = maxWeeksToShow weeks)
            timelineWidth = (weeksOfRunway / maxWeeksToShow) * 100;
        } else {
            // More than max weeks - show full bar
            timelineWidth = 100;
        }
        
        // Set gradient color based on severity
        if (weeksOfRunway < 2) {
            // Critical: Red
            gradient = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (weeksOfRunway < 4) {
            // Low: Orange
            gradient = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else if (weeksOfRunway < 8) {
            // Moderate: Yellow to orange
            gradient = 'linear-gradient(90deg, #eab308, #f59e0b)';
        } else {
            // Stable: Yellow to green
            gradient = 'linear-gradient(90deg, #eab308, #10b981)';
        }
    } else if (weeklyNetCashFlow > 0) {
        // Growing cash - show full green bar (infinite runway)
        weeksOfRunway = Infinity;
        timelineWidth = 100;
        gradient = 'linear-gradient(90deg, #10b981, #059669)';
    } else {
        // Break-even - show full yellow bar
        weeksOfRunway = Infinity;
        timelineWidth = 100;
        gradient = 'linear-gradient(90deg, #eab308, #d97706)';
    }
    
    // Apply the timeline fill
    timelineFill.style.width = `${Math.min(timelineWidth, 100)}%`;
    timelineFill.style.background = gradient;
    
    // Add shadow based on status
    let shadowColor;
    if (weeklyNetCashFlow < 0) {
        if (weeksOfRunway < 2) {
            shadowColor = 'rgba(239, 68, 68, 0.4)';
        } else if (weeksOfRunway < 4) {
            shadowColor = 'rgba(245, 158, 11, 0.4)';
        } else if (weeksOfRunway < 8) {
            shadowColor = 'rgba(234, 179, 8, 0.4)';
        } else {
            shadowColor = 'rgba(234, 179, 8, 0.3)';
        }
    } else if (weeklyNetCashFlow > 0) {
        shadowColor = 'rgba(16, 185, 129, 0.4)';
    } else {
        shadowColor = 'rgba(234, 179, 8, 0.3)';
    }
    
    timelineFill.style.boxShadow = `0 2px 8px ${shadowColor}`;
    
    // Update timeline markers to show where cash runs out
    updateTimelineMarkers(currentBalance, weeklyNetCashFlow, weeksOfRunway);
}

function updateTimelineMarkers(currentBalance, weeklyNetCashFlow, weeksOfRunway) {
    const timelineBar = document.querySelector('.timeline-bar');
    if (!timelineBar) return;

    // Remove existing markers
    const existingMarkers = timelineBar.querySelectorAll('.timeline-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Always show the standard week markers (1w, 2w, 3w)
    const standardMarkers = [
        { week: 1, position: 33.33 },
        { week: 2, position: 66.66 },
        { week: 3, position: 100 }
    ];
    
    standardMarkers.forEach(({ week, position }) => {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.cssText = `
            position: absolute;
            left: ${position}%;
            top: -5px;
            width: 1px;
            height: 10px;
            background: rgba(0, 0, 0, 0.2);
            z-index: 1;
        `;
        
        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #6b7280;
            white-space: nowrap;
        `;
        label.textContent = `${week}w`;
        
        marker.appendChild(label);
        timelineBar.appendChild(marker);
    });

    // If burning cash, show cash shortage warning marker
    if (weeklyNetCashFlow < 0 && weeksOfRunway !== Infinity) {
        const maxWeeksToShow = 12;
        let markerPosition = 0;
        
        if (weeksOfRunway <= maxWeeksToShow) {
            markerPosition = (weeksOfRunway / maxWeeksToShow) * 100;
        } else {
            markerPosition = 100;
        }
        
        // Only show warning marker if it's within the visible timeline (not beyond 100%)
        if (markerPosition <= 100) {
            const warningMarker = document.createElement('div');
            warningMarker.className = 'timeline-marker warning';
            warningMarker.style.cssText = `
                position: absolute;
                left: ${markerPosition}%;
                top: -8px;
                width: 2px;
            height: 16px;
            background: #ef4444;
            z-index: 2;
        `;
        
        const warningLabel = document.createElement('div');
        warningLabel.style.cssText = `
            position: absolute;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #ef4444;
            white-space: nowrap;
            font-weight: 600;
        `;
        
        if (weeksOfRunway <= maxWeeksToShow) {
            warningLabel.textContent = `${weeksOfRunway.toFixed(1)}w`;
        } else {
            warningLabel.textContent = `>${maxWeeksToShow}w`;
        }
        
        warningMarker.appendChild(warningLabel);
        timelineBar.appendChild(warningMarker);
        
        // Add a tooltip on hover
        warningMarker.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: #111827;
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                white-space: nowrap;
                z-index: 100;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            tooltip.textContent = `Cash runs out in ${weeksOfRunway.toFixed(1)} weeks`;
            warningMarker.appendChild(tooltip);
            
            warningMarker.addEventListener('mouseleave', () => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, { once: true });
        });
    }
    }
}

function updateMoneyInSection(incomeSources, currency, totalIncome) {
    const moneyInSection = document.querySelector('.money-in');
    if (!moneyInSection) return;

    const sectionHeader = moneyInSection.querySelector('.section-header');
    if (sectionHeader) {
        const existingTotal = sectionHeader.querySelector('.section-total');
        if (existingTotal) existingTotal.remove();
        
        const totalElement = document.createElement('div');
        totalElement.className = 'section-total';
        totalElement.innerHTML = `
            <div>${formatCurrency(totalIncome, currency)}</div>
            <div style="font-size: 0.8em; color: #6b7280;">monthly</div>
        `;
        totalElement.style.cssText = 'margin-left: auto; font-weight: 600; color: var(--success); text-align: right;';
        sectionHeader.appendChild(totalElement);
    }

    const moneyInList = moneyInSection.querySelector('.transaction-list');
    if (!moneyInList) return;

    moneyInList.innerHTML = '';

    if (incomeSources && incomeSources.length > 0) {
        incomeSources.forEach((source, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'transaction-item';
            listItem.dataset.id = index;
            listItem.dataset.type = 'income';
            listItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(source.name)}</div>
                    <div class="transaction-details">${formatIncomeType(source.type)} • ${formatCurrency(source.amount, currency)}/month</div>
                </div>
                <div class="transaction-amount">${formatCurrency(source.amount, currency)}</div>
                <div class="transaction-actions">
                    <button class="action-btn delete-btn" onclick="deleteIncome(${index})" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
            moneyInList.appendChild(listItem);
        });
    } else {
        moneyInList.innerHTML = '<li class="transaction-item"><div class="transaction-info"><div class="transaction-name">No income sources added</div></div></li>';
    }
}

function updateMoneyOutSection(expenses, currency, totalExpenses) {
    const moneyOutSection = document.querySelector('.money-out');
    if (!moneyOutSection) return;

    const sectionHeader = moneyOutSection.querySelector('.section-header');
    if (sectionHeader) {
        const existingTotal = sectionHeader.querySelector('.section-total');
        if (existingTotal) existingTotal.remove();
        
        const totalElement = document.createElement('div');
        totalElement.className = 'section-total';
        totalElement.innerHTML = `
            <div>${formatCurrency(totalExpenses, currency)}</div>
            <div style="font-size: 0.8em; color: #6b7280;">monthly</div>
        `;
        totalElement.style.cssText = 'margin-left: auto; font-weight: 600; color: var(--danger); text-align: right;';
        sectionHeader.appendChild(totalElement);
    }

    const moneyOutList = moneyOutSection.querySelector('.transaction-list');
    if (!moneyOutList) return;

    moneyOutList.innerHTML = '';

    if (expenses && expenses.length > 0) {
        expenses.forEach((expense, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'transaction-item';
            listItem.dataset.id = index;
            listItem.dataset.type = 'expense';
            listItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(expense.name)}</div>
                    <div class="transaction-details">${formatExpenseCategory(expense.category)} • ${formatCurrency(expense.amount, currency)}/month</div>
                </div>
                <div class="transaction-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="transaction-actions">
                    <button class="action-btn delete-btn" onclick="deleteExpense(${index})" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
            moneyOutList.appendChild(listItem);
        });
    } else {
        moneyOutList.innerHTML = '<li class="transaction-item"><div class="transaction-info"><div class="transaction-name">No expenses added</div></div></li>';
    }
}

function updateAlertsSection(invoices, currency, currentBalance, monthlyBurnRate, totalIncome, monthlyNetCashFlow) {
    const alertSection = document.querySelector('.alert-section');
    const alertText = document.querySelector('.alert-text');
    const alertIcon = document.querySelector('.alert-icon');
    
    if (!alertSection || !alertText || !alertIcon) return;

    const today = new Date();
    let alertMessage = '';
    let alertType = 'info';
    let showAlert = false;
    let iconSymbol = 'ℹ️';

    if (invoices && invoices.length > 0) {
        const overdueInvoices = invoices.filter(invoice => {
            const dueDate = new Date(invoice.due_date);
            return dueDate < today && invoice.status !== 'paid';
        });

        if (overdueInvoices.length > 0) {
            const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
            alertMessage = `You have ${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''} (${formatCurrency(totalOverdue, currency)}).`;
            alertType = 'danger';
            iconSymbol = '⚠️';
            showAlert = true;
        }
    }

    if (!showAlert && monthlyBurnRate > 0 && monthlyNetCashFlow < 0) {
        const weeklyBurnRate = Math.abs(monthlyNetCashFlow) / 4;
        const weeksOfRunway = currentBalance / weeklyBurnRate;
        
        if (weeksOfRunway < 2) {
            alertMessage = `Critical: Only ${weeksOfRunway.toFixed(1)} weeks of cash remaining!`;
            alertType = 'danger';
            iconSymbol = '🚨';
            showAlert = true;
        } else if (weeksOfRunway < 4) {
            alertMessage = `Low runway: ${weeksOfRunway.toFixed(1)} weeks of cash remaining.`;
            alertType = 'warning';
            iconSymbol = '⚠️';
            showAlert = true;
        } else if (weeksOfRunway < 8) {
            alertMessage = `Moderate runway: ${weeksOfRunway.toFixed(1)} weeks of cash.`;
            alertType = 'info';
            iconSymbol = 'ℹ️';
            showAlert = true;
        }
    }

    if (!showAlert) {
        if (monthlyNetCashFlow > 0) {
            alertMessage = `Positive cash flow! You're growing by ${formatCurrency(monthlyNetCashFlow/4, currency)}/week.`;
            alertType = 'success';
            iconSymbol = '✓';
            showAlert = true;
        } else if (monthlyBurnRate === 0 && currentBalance > 0) {
            alertMessage = `Healthy balance with no expenses. Great work!`;
            alertType = 'success';
            iconSymbol = '✓';
            showAlert = true;
        } else if (monthlyNetCashFlow === 0 && monthlyBurnRate > 0) {
            alertMessage = `Break-even cash flow. Consider growing income.`;
            alertType = 'info';
            iconSymbol = 'ℹ️';
            showAlert = true;
        }
    }

    if (showAlert) {
        alertText.textContent = alertMessage;
        alertIcon.textContent = iconSymbol;
        alertSection.style.display = 'flex';
        
        switch(alertType) {
            case 'success':
                alertSection.style.background = '#d1fae5';
                alertSection.style.borderColor = '#10b981';
                alertIcon.style.background = '#10b981';
                alertText.style.color = '#065f46';
                break;
            case 'warning':
                alertSection.style.background = '#fef3c7';
                alertSection.style.borderColor = '#f59e0b';
                alertIcon.style.background = '#f59e0b';
                alertText.style.color = '#92400e';
                break;
            case 'danger':
                alertSection.style.background = '#fee2e2';
                alertSection.style.borderColor = '#ef4444';
                alertIcon.style.background = '#ef4444';
                alertText.style.color = '#991b1b';
                break;
            default:
                alertSection.style.background = '#dbeafe';
                alertSection.style.borderColor = '#3b82f6';
                alertIcon.style.background = '#3b82f6';
                alertText.style.color = '#1e40af';
                break;
        }
        
        const alertButton = alertSection.querySelector('.alert-button');
        if (alertButton) {
            if (alertType === 'success') {
                alertButton.style.display = 'none';
            } else {
                alertButton.style.display = 'block';
            }
        }
    } else {
        alertSection.style.display = 'none';
    }
}

// Modal Functions
function showAddIncomeModal() {
    document.getElementById('addIncomeModal').style.display = 'flex';
}

function showAddExpenseModal() {
    document.getElementById('addExpenseModal').style.display = 'flex';
}

function closeModals() {
    const modals = [
        'addIncomeModal',
        'addExpenseModal',
        'editIncomeModal',
        'editExpenseModal'
    ];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

// Add new income source
async function addNewIncome() {
    try {
        const name = document.getElementById('newIncomeName').value;
        const amount = parseFloat(document.getElementById('newIncomeAmount').value);
        const type = document.getElementById('newIncomeType').value;

        if (!name || !amount || amount <= 0) {
            showErrorDialog('Validation Error', 'Please fill in all fields with valid values.');
            return;
        }

        showLoading('Adding income source...');

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('income_sources, currency')
            .eq('id', user.id)
            .single();

        const currentIncomeSources = profile?.income_sources || [];
        const newIncomeSources = [...currentIncomeSources, { name, amount, type }];

        const { error } = await supabaseClient
            .from('user_profiles')
            .update({
                income_sources: newIncomeSources,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) throw error;

        // Clear form fields
        document.getElementById('newIncomeName').value = '';
        document.getElementById('newIncomeAmount').value = '';
        document.getElementById('newIncomeType').value = 'salary';
        
        // Close modal
        const modal = document.getElementById('addIncomeModal');
        if (modal) modal.style.display = 'none';
        
        // Show success dialog instead of loading
        hideLoading();
        showAddSuccessDialog(name, 'Income Source');
        
        // Refresh dashboard with currency
        setTimeout(async () => {
            await loadDashboardData();
        }, 1500);

    } catch (error) {
        console.error('Error adding income:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to add income source. Please try again.');
    }
}

// Add new expense
async function addNewExpense() {
    try {
        const name = document.getElementById('newExpenseName').value;
        const amount = parseFloat(document.getElementById('newExpenseAmount').value);
        const category = document.getElementById('newExpenseCategory').value;

        if (!name || !amount || amount <= 0) {
            showErrorDialog('Validation Error', 'Please fill in all fields with valid values.');
            return;
        }

        showLoading('Adding expense...');

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('expenses, currency')
            .eq('id', user.id)
            .single();

        const currentExpenses = profile?.expenses || [];
        const newExpenses = [...currentExpenses, { name, amount, category }];

        const { error } = await supabaseClient
            .from('user_profiles')
            .update({
                expenses: newExpenses,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) throw error;

        // Clear form fields
        document.getElementById('newExpenseName').value = '';
        document.getElementById('newExpenseAmount').value = '';
        document.getElementById('newExpenseCategory').value = 'housing';
        
        // Close modal
        closeModals();
        
        // Show success dialog
        hideLoading();
        showAddSuccessDialog(name, 'Expense');
        
        // Refresh dashboard with currency
        setTimeout(async () => {
            await loadDashboardData();
        }, 1500);

    } catch (error) {
        console.error('Error adding expense:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to add expense. Please try again.');
    }
}

// Edit and Delete functions
window.editIncome = async function(index) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('income_sources, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.income_sources || !profile.income_sources[index]) {
            showErrorDialog('Not Found', 'Income source not found.');
            return;
        }

        const income = profile.income_sources[index];
        document.getElementById('editIncomeName').value = income.name;
        document.getElementById('editIncomeAmount').value = income.amount;
        document.getElementById('editIncomeType').value = income.type;
        document.getElementById('editIncomeIndex').value = index;
        document.getElementById('editIncomeModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error editing income:', error);
        showErrorDialog('Error', 'Failed to load income source for editing.');
    }
}

window.deleteIncome = async function(index) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('income_sources, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.income_sources || !profile.income_sources[index]) {
            showErrorDialog('Not Found', 'Income source not found.');
            return;
        }

        const incomeName = profile.income_sources[index].name;
        
        // Show delete confirmation dialog
        showDeleteConfirmation(incomeName, 'Income Source', async () => {
            showLoading('Deleting income source...');

            const updatedIncomeSources = profile.income_sources.filter((_, i) => i !== index);

            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    income_sources: updatedIncomeSources,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Show success dialog
            hideLoading();
            showSuccessDialog('Deleted Successfully', `"${incomeName}" has been removed from your income sources.`);
            
            // Refresh dashboard with currency
            setTimeout(async () => {
                await loadDashboardData();
            }, 1500);
        });

    } catch (error) {
        console.error('Error deleting income:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to delete income source. Please try again.');
    }
}

window.editExpense = async function(index) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('expenses, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.expenses || !profile.expenses[index]) {
            showErrorDialog('Not Found', 'Expense not found.');
            return;
        }

        const expense = profile.expenses[index];
        document.getElementById('editExpenseName').value = expense.name;
        document.getElementById('editExpenseAmount').value = expense.amount;
        document.getElementById('editExpenseCategory').value = expense.category;
        document.getElementById('editExpenseIndex').value = index;
        document.getElementById('editExpenseModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error editing expense:', error);
        showErrorDialog('Error', 'Failed to load expense for editing.');
    }
}

window.deleteExpense = async function(index) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('expenses, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.expenses || !profile.expenses[index]) {
            showErrorDialog('Not Found', 'Expense not found.');
            return;
        }

        const expenseName = profile.expenses[index].name;
        
        // Show delete confirmation dialog
        showDeleteConfirmation(expenseName, 'Expense', async () => {
            showLoading('Deleting expense...');

            const updatedExpenses = profile.expenses.filter((_, i) => i !== index);

            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    expenses: updatedExpenses,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Show success dialog
            hideLoading();
            showSuccessDialog('Deleted Successfully', `"${expenseName}" has been removed from your expenses.`);
            
            // Refresh dashboard with currency
            setTimeout(async () => {
                await loadDashboardData();
            }, 1500);
        });

    } catch (error) {
        console.error('Error deleting expense:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to delete expense. Please try again.');
    }
}

// Update functions
window.updateIncome = async function() {
    try {
        const index = parseInt(document.getElementById('editIncomeIndex').value);
        const name = document.getElementById('editIncomeName').value;
        const amount = parseFloat(document.getElementById('editIncomeAmount').value);
        const type = document.getElementById('editIncomeType').value;

        if (!name || !amount || amount <= 0) {
            showErrorDialog('Validation Error', 'Please fill in all fields with valid values.');
            return;
        }

        showLoading('Updating income source...');

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('income_sources, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.income_sources) return;

        const updatedIncomeSources = [...profile.income_sources];
        updatedIncomeSources[index] = { name, amount, type };

        const { error } = await supabaseClient
            .from('user_profiles')
            .update({
                income_sources: updatedIncomeSources,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) throw error;

        // Close modal
        document.getElementById('editIncomeModal').style.display = 'none';
        
        // Show success dialog
        hideLoading();
        showUpdateSuccessDialog(name, 'Income Source');
        
        // Refresh dashboard with currency
        setTimeout(async () => {
            await loadDashboardData();
        }, 1500);

    } catch (error) {
        console.error('Error updating income:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to update income source. Please try again.');
    }
}

window.updateExpense = async function() {
    try {
        const index = parseInt(document.getElementById('editExpenseIndex').value);
        const name = document.getElementById('editExpenseName').value;
        const amount = parseFloat(document.getElementById('editExpenseAmount').value);
        const category = document.getElementById('editExpenseCategory').value;

        if (!name || !amount || amount <= 0) {
            showErrorDialog('Validation Error', 'Please fill in all fields with valid values.');
            return;
        }

        showLoading('Updating expense...');

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('expenses, currency')
            .eq('id', user.id)
            .single();

        if (!profile?.expenses) return;

        const updatedExpenses = [...profile.expenses];
        updatedExpenses[index] = { name, amount, category };

        const { error } = await supabaseClient
            .from('user_profiles')
            .update({
                expenses: updatedExpenses,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) throw error;

        // Close modal
        document.getElementById('editExpenseModal').style.display = 'none';
        
        // Show success dialog
        hideLoading();
        showUpdateSuccessDialog(name, 'Expense');
        
        // Refresh dashboard with currency
        setTimeout(async () => {
            await loadDashboardData();
        }, 1500);

    } catch (error) {
        console.error('Error updating expense:', error);
        hideLoading();
        showErrorDialog('Error', 'Failed to update expense. Please try again.');
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper functions
function formatCurrency(amount, currency = 'USD') {
    if (!currency) currency = 'USD';
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (error) {
        console.error('Error formatting currency:', error);
        // Fallback to basic formatting
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

function formatIncomeType(type) {
    const typeMap = {
        'salary': 'Salary',
        'freelance': 'Freelance',
        'investment': 'Investment',
        'rental': 'Rental',
        'other': 'Other'
    };
    return typeMap[type] || type;
}

function formatExpenseCategory(category) {
    const categoryMap = {
        'housing': 'Housing',
        'utilities': 'Utilities',
        'food': 'Food & Dining',
        'transportation': 'Transportation',
        'entertainment': 'Entertainment',
        'business': 'Business',
        'other': 'Other'
    };
    return categoryMap[category] || category;
}

// Initialize dashboard - NO REDIRECTS VERSION
async function initializeDashboard() {
    console.log('🚀 Initializing dashboard...');
    
    // Show loading immediately
    showLoading('Loading your dashboard...', 'Preparing your financial insights');
    
    // Check authentication quietly
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            hideLoading();
            showErrorOnPage('Authentication error. Please try signing in again.');
            return;
        }
        
        if (!session) {
            console.log('No session found');
            hideLoading();
            showErrorOnPage('Please sign in to view your dashboard.');
            return;
        }
        
        console.log('✅ User authenticated:', session.user.email);
        
        // Load dashboard data
        await loadDashboardData();
        
        // Setup modal event listeners
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
            button.addEventListener('click', closeModals);
        });

        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeModals();
            }
        });
        
        // Setup sign out button if exists
        const signOutBtn = document.querySelector('.sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    showLoading('Signing out...');
                    await supabaseClient.auth.signOut();
                    hideLoading();
                    // Manual redirect only when user explicitly signs out
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error signing out:', error);
                    hideLoading();
                    showErrorDialog('Error', 'Failed to sign out. Please try again.');
                }
            });
        }
        
        // Setup add buttons
        const addIncomeBtn = document.querySelector('.btn-add-income');
        const addExpenseBtn = document.querySelector('.btn-add-expense');
        
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', showAddIncomeModal);
        }
        
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', showAddExpenseModal);
        }
        
        // Setup form submissions
        const addIncomeForm = document.getElementById('addIncomeForm');
        const addExpenseForm = document.getElementById('addExpenseForm');
        const editIncomeForm = document.getElementById('editIncomeForm');
        const editExpenseForm = document.getElementById('editExpenseForm');
        
        if (addIncomeForm) {
            addIncomeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addNewIncome();
            });
        }
        
        if (addExpenseForm) {
            addExpenseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addNewExpense();
            });
        }
        
        if (editIncomeForm) {
            editIncomeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                updateIncome();
            });
        }
        
        if (editExpenseForm) {
            editExpenseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                updateExpense();
            });
        }
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        hideLoading();
        showErrorOnPage('Failed to load dashboard. Please try again.');
    }
}

// Payment Reminders System
async function checkPaymentReminders() {
  try {
    // 1. Get user data
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    // 2. Get user's invoices from Supabase
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('invoices, currency')
      .eq('id', user.id)
      .single();
    
    if (!profile || !profile.invoices) return;
    
    // 3. Check for due invoices
    const today = new Date();
    const reminders = [];
    
    profile.invoices.forEach(invoice => {
      if (invoice.status === 'pending') {
        const dueDate = new Date(invoice.due_date);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Show reminders for invoices due in 7 days or less
        if (daysUntilDue <= 7 && daysUntilDue >= 0) {
          reminders.push({
            invoiceNumber: invoice.number,
            client: invoice.client,
            amount: invoice.amount,
            dueDate: invoice.due_date,
            daysUntilDue: daysUntilDue,
            currency: profile.currency || 'USD'
          });
        }
        
        // Show overdue invoices
        if (daysUntilDue < 0) {
          reminders.push({
            invoiceNumber: invoice.number,
            client: invoice.client,
            amount: invoice.amount,
            dueDate: invoice.due_date,
            daysUntilDue: daysUntilDue,
            overdue: true,
            currency: profile.currency || 'USD'
          });
        }
      }
    });
    
    // 4. Display reminders if any exist
    if (reminders.length > 0) {
      displayReminders(reminders);
    }
    
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

function displayReminders(reminders) {
  const container = document.getElementById('reminderContainer');
  const messageElement = document.getElementById('reminderMessage');
  
  if (!container || !messageElement) return;
  
  // Group reminders
  const overdue = reminders.filter(r => r.overdue);
  const upcoming = reminders.filter(r => !r.overdue);
  
  let message = '';
  
  if (overdue.length > 0) {
    message += `<strong>Overdue:</strong> `;
    message += overdue.map(r => 
      `${r.invoiceNumber} (${r.client}) - ${formatCurrency(r.amount, r.currency)} - ${Math.abs(r.daysUntilDue)} days overdue`
    ).join(', ');
    message += '<br>';
  }
  
  if (upcoming.length > 0) {
    message += `<strong>Due soon:</strong> `;
    message += upcoming.map(r => 
      `${r.invoiceNumber} (${r.client}) - ${formatCurrency(r.amount, r.currency)} - due in ${r.daysUntilDue} days`
    ).join(', ');
  }
  
  messageElement.innerHTML = message;
  container.style.display = 'block';
  
  // Auto-hide after 10 seconds (optional)
  setTimeout(() => {
    container.style.display = 'none';
  }, 10000);
}

// Create HTML modals if they don't exist
function createModals() {
    if (!document.getElementById('addIncomeModal')) {
        const modalHTML = `
            <!-- Add Income Modal -->
            <div id="addIncomeModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Add Income Source</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="addIncomeForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label" for="newIncomeName">Name</label>
                                <input type="text" id="newIncomeName" class="form-input" placeholder="e.g., Salary, Freelance Work" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="newIncomeAmount">Monthly Amount</label>
                                <input type="number" id="newIncomeAmount" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="newIncomeType">Type</label>
                                <select id="newIncomeType" class="form-select" required>
                                    <option value="salary">Salary</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="investment">Investment</option>
                                    <option value="rental">Rental Income</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Income</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Expense Modal -->
            <div id="addExpenseModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Add Expense</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="addExpenseForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label" for="newExpenseName">Name</label>
                                <input type="text" id="newExpenseName" class="form-input" placeholder="e.g., Rent, Utilities" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="newExpenseAmount">Monthly Amount</label>
                                <input type="number" id="newExpenseAmount" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="newExpenseCategory">Category</label>
                                <select id="newExpenseCategory" class="form-select" required>
                                    <option value="housing">Housing</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="food">Food & Dining</option>
                                    <option value="transportation">Transportation</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="business">Business</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Expense</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Income Modal -->
            <div id="editIncomeModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Edit Income Source</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="editIncomeForm">
                        <input type="hidden" id="editIncomeIndex">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label" for="editIncomeName">Name</label>
                                <input type="text" id="editIncomeName" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="editIncomeAmount">Monthly Amount</label>
                                <input type="number" id="editIncomeAmount" class="form-input" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="editIncomeType">Type</label>
                                <select id="editIncomeType" class="form-select" required>
                                    <option value="salary">Salary</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="investment">Investment</option>
                                    <option value="rental">Rental Income</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Income</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Expense Modal -->
            <div id="editExpenseModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Edit Expense</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="editExpenseForm">
                        <input type="hidden" id="editExpenseIndex">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label" for="editExpenseName">Name</label>
                                <input type="text" id="editExpenseName" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="editExpenseAmount">Monthly Amount</label>
                                <input type="number" id="editExpenseAmount" class="form-input" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="editExpenseCategory">Category</label>
                                <select id="editExpenseCategory" class="form-select" required>
                                    <option value="housing">Housing</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="food">Food & Dining</option>
                                    <option value="transportation">Transportation</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="business">Business</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Create reminder container if it doesn't exist
function createReminderContainer() {
    if (!document.getElementById('reminderContainer')) {
        const reminderHTML = `
            <div id="reminderContainer" style="display: none; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 16px 0;">
                <div id="reminderMessage" style="font-size: 14px; color: #92400e;"></div>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('afterbegin', reminderHTML);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create modals and reminder container
    createModals();
    createReminderContainer();
    
    // Check reminders when dashboard loads
    setTimeout(() => {
        checkPaymentReminders();
    }, 2000);
    
    // Check every hour (optional)
    setInterval(checkPaymentReminders, 60 * 60 * 1000);
});