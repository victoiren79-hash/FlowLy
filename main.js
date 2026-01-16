// At the top of dashboard.js, make sure you have:
const supabaseUrl = 'https://wkcbggxtmwttdjxtoieh.supabase.co';
const supabaseKey = 'sb_publishable_SkNcPG8vCj2xB-KORM4_tQ_Q2_MlBwe';

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'default_service',
    templateId: 'template_4agrj1a',
    userId: 'ViKEF4HrhrIGcmkfK'
};

let supabaseClient;
let cachedUserProfile = null; // Cache user profile to prevent repeated API calls

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

// Add CSS styles
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

function showLoading(message = 'Loading...') {
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

// Simple dialog system (optimized)
function showDialog(options) {
    const {
        type = 'info',
        title = 'Notification',
        message = '',
        confirmText = 'OK',
        onConfirm = null
    } = options;
    
    // Remove any existing dialogs
    const existingDialog = document.getElementById('globalDialogOverlay');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.id = 'globalDialogOverlay';
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✓'; break;
        case 'warning': icon = '⚠️'; break;
        case 'danger': icon = '🗑️'; break;
        default: icon = 'ℹ️';
    }
    
    dialogOverlay.innerHTML = `
        <div class="dialog-box">
            <div class="dialog-header">
                <div class="dialog-icon ${type}">${icon}</div>
                <h3 class="dialog-title">${title}</h3>
            </div>
            <div class="dialog-content">${message}</div>
            <div class="dialog-actions">
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
    
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            closeDialog();
        }
    });
}

function showSuccessDialog(title, message) {
    showDialog({
        type: 'success',
        title: title,
        message: message,
        confirmText: 'Got it!'
    });
}

function showDeleteConfirmation(itemName, itemType, onDelete) {
    showDialog({
        type: 'danger',
        title: `Delete ${itemType}`,
        message: `Are you sure you want to delete <strong>"${itemName}"</strong>?`,
        confirmText: 'Delete',
        onConfirm: onDelete
    });
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS - OPTIMIZED
// ============================================

// Initialize EmailJS only when needed
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && !emailjs._isInitialized) {
        emailjs.init(EMAILJS_CONFIG.userId);
        console.log('✅ EmailJS initialized');
    }
}

// Check and send notifications (async but non-blocking)
async function checkAllNotifications() {
    console.log('🔔 Checking notifications...');
    
    // Only check if we have a cached profile
    if (!cachedUserProfile) return;
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    const currentBalance = parseFloat(cachedUserProfile.current_balance) || 0;
    const currency = cachedUserProfile.currency || 'USD';
    
    // Check low balance (only if < $1000)
    if (currentBalance < 1000) {
        console.log('⚠️ Low balance detected');
        
        // Check if we sent this recently
        const lastSentKey = `lastLowBalanceEmail_${user.id}`;
        const lastSent = localStorage.getItem(lastSentKey);
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        if (!lastSent || parseInt(lastSent) < twentyFourHoursAgo) {
            // Send in background without blocking UI
            setTimeout(() => {
                sendLowBalanceEmail(user, currentBalance, currency);
            }, 5000); // Wait 5 seconds before sending
        }
    }
}

// Send email in background
async function sendLowBalanceEmail(user, balance, currency) {
    try {
        initEmailJS();
        
        const templateParams = {
            name: user.user_metadata?.name || user.email,
            balance: formatCurrency(balance, currency),
            threshold: formatCurrency(1000, currency),
            dashboard_url: window.location.origin + '/dashboard.html',
            to_email: user.email
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            localStorage.setItem(`lastLowBalanceEmail_${user.id}`, Date.now().toString());
            console.log('✅ Low balance email sent');
        }
    } catch (error) {
        console.error('Email failed:', error);
    }
}

// ============================================
// MAIN DASHBOARD FUNCTIONS - OPTIMIZED
// ============================================

// Load dashboard data FAST
async function loadDashboardData() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            hideLoading();
            showErrorOnPage('Please sign in to view your dashboard.');
            return;
        }

        // Use cached data if available and recent (last 30 seconds)
        if (cachedUserProfile && (Date.now() - cachedUserProfile._timestamp < 30000)) {
            console.log('📊 Using cached profile data');
            updateDashboardWithRealData(cachedUserProfile);
            hideLoading();
            
            // Check notifications in background
            setTimeout(checkAllNotifications, 1000);
            return;
        }

        // Fetch fresh data
        console.log('📊 Fetching fresh profile data');
        const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            hideLoading();
            if (error.code === 'PGRST116') {
                showErrorOnPage('Please complete onboarding first.');
            } else {
                showDialog({
                    type: 'danger',
                    title: 'Error Loading Dashboard',
                    message: 'Failed to load your financial data. Please try again.',
                    confirmText: 'OK'
                });
            }
            return;
        }

        // Cache the profile data
        profile._timestamp = Date.now();
        cachedUserProfile = profile;

        // Update UI immediately
        updateDashboardWithRealData(profile);
        hideLoading();
        
        // Check notifications in background (non-blocking)
        setTimeout(checkAllNotifications, 1000);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        hideLoading();
        showDialog({
            type: 'danger',
            title: 'Error',
            message: 'An error occurred. Please refresh the page.',
            confirmText: 'OK'
        });
    }
}

// Update dashboard with real data (optimized)
function updateDashboardWithRealData(profile) {
    if (!profile) return;

    // Calculate values
    const totalIncome = profile.income_sources?.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0) || 0;
    const totalExpenses = profile.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0;
    const monthlyNetCashFlow = totalIncome - totalExpenses;
    const weeklyNetCashFlow = monthlyNetCashFlow / 4.33;
    const currency = profile.currency || 'USD';

    // Update main metrics immediately
    const balanceElement = document.querySelector('.balance-amount');
    const burnRateElement = document.querySelector('.burn-rate');
    
    if (balanceElement) balanceElement.textContent = formatCurrency(profile.current_balance, currency);
    
    if (burnRateElement) {
        burnRateElement.innerHTML = `
            <div>${formatCurrency(totalExpenses, currency)} <span style="color: #6b7280; font-size: 0.9em">/month</span></div>
            <div style="font-size: 0.9em; color: #6b7280;">(${formatCurrency(totalExpenses/4.33, currency)}/week)</div>
        `;
    }

    // Update sections
    updateForecast(profile.current_balance, totalIncome, totalExpenses, weeklyNetCashFlow, currency);
    updateTimelineBar(profile.current_balance, weeklyNetCashFlow);
    updateMoneyInSection(profile.income_sources, currency, totalIncome);
    updateMoneyOutSection(profile.expenses, currency, totalExpenses);
}

// Optimized forecast update
function updateForecast(currentBalance, totalIncome, totalExpenses, weeklyNetCashFlow, currency) {
    const forecastElement = document.querySelector('.forecast-insight .insight-text');
    if (!forecastElement) return;

    let forecastMessage = '';
    
    if (weeklyNetCashFlow < 0) {
        const weeksOfRunway = currentBalance / Math.abs(weeklyNetCashFlow);
        let status = 'STABLE';
        let color = '#10b981';
        
        if (weeksOfRunway < 2) {
            status = 'CRITICAL';
            color = '#dc2626';
        } else if (weeksOfRunway < 4) {
            status = 'LOW';
            color = '#d97706';
        } else if (weeksOfRunway < 8) {
            status = 'MODERATE';
            color = '#2563eb';
        }
        
        forecastMessage = `
            📊 <span style="color: ${color}; font-weight: 600;">${status}</span> cash position<br>
            • Runway: ${weeksOfRunway.toFixed(1)} weeks<br>
            • Weekly burn: ${formatCurrency(Math.abs(weeklyNetCashFlow), currency)}<br>
            • 4-week forecast: ${formatCurrency(Math.max(0, currentBalance + (weeklyNetCashFlow * 4)), currency)}
        `;
    } else if (weeklyNetCashFlow > 0) {
        forecastMessage = `
            📈 <span style="color: #10b981; font-weight: 600;">GROWING</span> cash position<br>
            • Weekly growth: ${formatCurrency(weeklyNetCashFlow, currency)}<br>
            • 4-week forecast: ${formatCurrency(currentBalance + (weeklyNetCashFlow * 4), currency)}<br>
            • Sustainable runway
        `;
    } else {
        forecastMessage = `
            ⚖️ <span style="color: #6b7280; font-weight: 600;">STABLE</span> cash position<br>
            • Break-even cash flow<br>
            • Balance maintained<br>
            • Consider growth opportunities
        `;
    }

    forecastElement.innerHTML = forecastMessage;
}

// Optimized timeline bar
function updateTimelineBar(currentBalance, weeklyNetCashFlow) {
    const timelineFill = document.querySelector('.timeline-fill');
    if (!timelineFill) return;

    let width = 100;
    let gradient = '';
    
    if (weeklyNetCashFlow < 0) {
        const weeksOfRunway = currentBalance / Math.abs(weeklyNetCashFlow);
        width = Math.min((weeksOfRunway / 12) * 100, 100);
        
        if (weeksOfRunway < 2) {
            gradient = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (weeksOfRunway < 4) {
            gradient = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else if (weeksOfRunway < 8) {
            gradient = 'linear-gradient(90deg, #eab308, #f59e0b)';
        } else {
            gradient = 'linear-gradient(90deg, #eab308, #10b981)';
        }
    } else if (weeklyNetCashFlow > 0) {
        gradient = 'linear-gradient(90deg, #10b981, #059669)';
    } else {
        gradient = 'linear-gradient(90deg, #eab308, #d97706)';
    }
    
    timelineFill.style.width = `${width}%`;
    timelineFill.style.background = gradient;
}

// Optimized money in section
function updateMoneyInSection(incomeSources, currency, totalIncome) {
    const moneyInSection = document.querySelector('.money-in');
    if (!moneyInSection) return;

    const moneyInList = moneyInSection.querySelector('.transaction-list');
    if (!moneyInList) return;

    moneyInList.innerHTML = '';

    if (incomeSources && incomeSources.length > 0) {
        // Use DocumentFragment for faster DOM updates
        const fragment = document.createDocumentFragment();
        
        incomeSources.forEach((source, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'transaction-item';
            listItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(source.name)}</div>
                    <div class="transaction-details">${source.type} • ${formatCurrency(source.amount, currency)}/month</div>
                </div>
                <div class="transaction-amount">${formatCurrency(source.amount, currency)}</div>
                <div class="transaction-actions">
                    <button class="action-btn delete-btn" onclick="deleteIncome(${index})" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
            fragment.appendChild(listItem);
        });
        
        moneyInList.appendChild(fragment);
    } else {
        moneyInList.innerHTML = '<li class="transaction-item"><div class="transaction-info"><div class="transaction-name">No income sources</div></div></li>';
    }

    // Update total
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
        totalElement.style.cssText = 'margin-left: auto; font-weight: 600; color: #10b981; text-align: right;';
        sectionHeader.appendChild(totalElement);
    }
}

// Optimized money out section
function updateMoneyOutSection(expenses, currency, totalExpenses) {
    const moneyOutSection = document.querySelector('.money-out');
    if (!moneyOutSection) return;

    const moneyOutList = moneyOutSection.querySelector('.transaction-list');
    if (!moneyOutList) return;

    moneyOutList.innerHTML = '';

    if (expenses && expenses.length > 0) {
        const fragment = document.createDocumentFragment();
        
        expenses.forEach((expense, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'transaction-item';
            listItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(expense.name)}</div>
                    <div class="transaction-details">${expense.category} • ${formatCurrency(expense.amount, currency)}/month</div>
                </div>
                <div class="transaction-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="transaction-actions">
                    <button class="action-btn delete-btn" onclick="deleteExpense(${index})" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
            fragment.appendChild(listItem);
        });
        
        moneyOutList.appendChild(fragment);
    } else {
        moneyOutList.innerHTML = '<li class="transaction-item"><div class="transaction-info"><div class="transaction-name">No expenses</div></div></li>';
    }

    // Update total
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
        totalElement.style.cssText = 'margin-left: auto; font-weight: 600; color: #ef4444; text-align: right;';
        sectionHeader.appendChild(totalElement);
    }
}

// Modal Functions (optimized)
function showAddIncomeModal() {
    document.getElementById('addIncomeModal').style.display = 'flex';
}

function showAddExpenseModal() {
    document.getElementById('addExpenseModal').style.display = 'flex';
}

function closeModals() {
    ['addIncomeModal', 'addExpenseModal', 'editIncomeModal', 'editExpenseModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    });
}

// Add new income source (optimized)
async function addNewIncome() {
    const name = document.getElementById('newIncomeName').value;
    const amount = parseFloat(document.getElementById('newIncomeAmount').value);
    const type = document.getElementById('newIncomeType').value;

    if (!name || !amount || amount <= 0) {
        showDialog({
            type: 'danger',
            title: 'Validation Error',
            message: 'Please fill in all fields with valid values.',
            confirmText: 'OK'
        });
        return;
    }

    showLoading('Adding...');

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('income_sources')
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

        // Clear form and close modal
        document.getElementById('newIncomeName').value = '';
        document.getElementById('newIncomeAmount').value = '';
        document.getElementById('addIncomeModal').style.display = 'none';
        
        // Invalidate cache
        cachedUserProfile = null;
        
        // Reload data quickly
        await loadDashboardData();
        
        // Show success
        showDialog({
            type: 'success',
            title: 'Success!',
            message: `"${name}" has been added to your income sources.`,
            confirmText: 'Great!'
        });

    } catch (error) {
        console.error('Error adding income:', error);
        hideLoading();
        showDialog({
            type: 'danger',
            title: 'Error',
            message: 'Failed to add income source. Please try again.',
            confirmText: 'OK'
        });
    }
}

// Add new expense (optimized)
async function addNewExpense() {
    const name = document.getElementById('newExpenseName').value;
    const amount = parseFloat(document.getElementById('newExpenseAmount').value);
    const category = document.getElementById('newExpenseCategory').value;

    if (!name || !amount || amount <= 0) {
        showDialog({
            type: 'danger',
            title: 'Validation Error',
            message: 'Please fill in all fields with valid values.',
            confirmText: 'OK'
        });
        return;
    }

    showLoading('Adding...');

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('expenses')
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

        // Clear form and close modal
        document.getElementById('newExpenseName').value = '';
        document.getElementById('newExpenseAmount').value = '';
        closeModals();
        
        // Invalidate cache
        cachedUserProfile = null;
        
        // Reload data quickly
        await loadDashboardData();
        
        // Show success
        showDialog({
            type: 'success',
            title: 'Success!',
            message: `"${name}" has been added to your expenses.`,
            confirmText: 'Great!'
        });

    } catch (error) {
        console.error('Error adding expense:', error);
        hideLoading();
        showDialog({
            type: 'danger',
            title: 'Error',
            message: 'Failed to add expense. Please try again.',
            confirmText: 'OK'
        });
    }
}

// Delete functions (optimized)
window.deleteIncome = async function(index) {
    showDeleteConfirmation('Income Source', 'Income Source', async () => {
        showLoading('Deleting...');

        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: profile } = await supabaseClient
                .from('user_profiles')
                .select('income_sources')
                .eq('id', user.id)
                .single();

            if (!profile?.income_sources || !profile.income_sources[index]) {
                throw new Error('Income source not found');
            }

            const updatedIncomeSources = profile.income_sources.filter((_, i) => i !== index);

            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    income_sources: updatedIncomeSources,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Invalidate cache
            cachedUserProfile = null;
            
            // Reload data quickly
            await loadDashboardData();
            
            // Show success
            showDialog({
                type: 'success',
                title: 'Deleted!',
                message: 'Income source has been removed.',
                confirmText: 'OK'
            });

        } catch (error) {
            console.error('Error deleting income:', error);
            hideLoading();
            showDialog({
                type: 'danger',
                title: 'Error',
                message: 'Failed to delete income source.',
                confirmText: 'OK'
            });
        }
    });
}

window.deleteExpense = async function(index) {
    showDeleteConfirmation('Expense', 'Expense', async () => {
        showLoading('Deleting...');

        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: profile } = await supabaseClient
                .from('user_profiles')
                .select('expenses')
                .eq('id', user.id)
                .single();

            if (!profile?.expenses || !profile.expenses[index]) {
                throw new Error('Expense not found');
            }

            const updatedExpenses = profile.expenses.filter((_, i) => i !== index);

            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    expenses: updatedExpenses,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Invalidate cache
            cachedUserProfile = null;
            
            // Reload data quickly
            await loadDashboardData();
            
            // Show success
            showDialog({
                type: 'success',
                title: 'Deleted!',
                message: 'Expense has been removed.',
                confirmText: 'OK'
            });

        } catch (error) {
            console.error('Error deleting expense:', error);
            hideLoading();
            showDialog({
                type: 'danger',
                title: 'Error',
                message: 'Failed to delete expense.',
                confirmText: 'OK'
            });
        }
    });
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCurrency(amount, currency = 'USD') {
    if (!currency) currency = 'USD';
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    } catch (error) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize dashboard (optimized)
async function initializeDashboard() {
    console.log('🚀 Initializing dashboard...');
    
    // Show loading immediately
    showLoading('Loading dashboard...');
    
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            hideLoading();
            showErrorOnPage('Please sign in to view your dashboard.');
            return;
        }
        
        console.log('✅ User authenticated:', session.user.email);
        
        // Load dashboard data immediately
        await loadDashboardData();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Dashboard initialized');
        
    } catch (error) {
        console.error('Error initializing:', error);
        hideLoading();
        showErrorOnPage('Failed to load dashboard. Please refresh.');
    }
}

// Setup event listeners (optimized)
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
        button.addEventListener('click', closeModals);
    });

    // Close modals on background click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Add buttons
    const addIncomeBtn = document.querySelector('.btn-add-income');
    const addExpenseBtn = document.querySelector('.btn-add-expense');
    
    if (addIncomeBtn) addIncomeBtn.addEventListener('click', showAddIncomeModal);
    if (addExpenseBtn) addExpenseBtn.addEventListener('click', showAddExpenseModal);
    
    // Form submissions
    const addIncomeForm = document.getElementById('addIncomeForm');
    const addExpenseForm = document.getElementById('addExpenseForm');
    
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
    
    // Sign out button
    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                showLoading('Signing out...');
                await supabaseClient.auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error signing out:', error);
                hideLoading();
                showDialog({
                    type: 'danger',
                    title: 'Error',
                    message: 'Failed to sign out.',
                    confirmText: 'OK'
                });
            }
        });
    }
}

// Create HTML modals (optimized)
function createModals() {
    if (!document.getElementById('addIncomeModal')) {
        const modalHTML = `
            <!-- Add Income Modal -->
            <div id="addIncomeModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Add Income</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="addIncomeForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Name</label>
                                <input type="text" id="newIncomeName" class="form-input" placeholder="e.g., Salary" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Monthly Amount</label>
                                <input type="number" id="newIncomeAmount" class="form-input" placeholder="0" min="0" step="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Type</label>
                                <select id="newIncomeType" class="form-select" required>
                                    <option value="salary">Salary</option>
                                    <option value="freelance">Freelance</option>
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
                                <label class="form-label">Name</label>
                                <input type="text" id="newExpenseName" class="form-input" placeholder="e.g., Rent" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Monthly Amount</label>
                                <input type="number" id="newExpenseAmount" class="form-input" placeholder="0" min="0" step="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select id="newExpenseCategory" class="form-select" required>
                                    <option value="housing">Housing</option>
                                    <option value="food">Food</option>
                                    <option value="transportation">Transportation</option>
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
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    createModals();
});
