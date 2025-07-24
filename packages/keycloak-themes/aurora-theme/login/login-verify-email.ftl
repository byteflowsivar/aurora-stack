<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailVerifyTitle")}
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <div class="kc-login-container">
                    <!-- Left Column - Illustration -->
                    <div class="kc-illustration-panel">
                        <div class="kc-illustration">
                            <svg class="kc-geometric-shape" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                                <!-- Main geometric shape -->
                                <!-- Main shape -->
                                <path d="M80 100 L200 80 L320 140 L280 260 L160 280 L120 200 Z" fill="#16056B" opacity="0.9"/>
                                <!-- Secondary shapes -->
                                <circle cx="300" cy="120" r="40" fill="#5696FA" opacity="0.7"/>
                                <rect x="100" y="220" width="60" height="60" rx="15" fill="#5696FA" opacity="0.6" transform="rotate(15 130 250)"/>
                                <path d="M240 200 L280 180 L300 220 L260 240 Z" fill="#FD9619" opacity="0.8"/>
                            </svg>
                        </div>
                    </div>
                    
                    <!-- Right Column - Form -->
                    <div class="kc-form-panel">
                        <div class="kc-card kc-fade-in">
                            <!-- Header -->
                            <div class="kc-header">
                                <div class="kc-logo">
                                    A
                                </div>
                                <h1 class="kc-title">${msg("emailVerifyTitle")}</h1>
                                <p class="kc-subtitle">${msg("emailVerifyInstruction1")}</p>
                            </div>

                <!-- Messages -->
                <#if message?has_content && message.type != 'warning' && !messagesPerField.existsError('username')>
                    <div class="kc-message kc-message-${message.type}">
                        <span class="kc-message-summary">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <!-- Email sent confirmation -->
                <div class="kc-message kc-message-info">
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                        <p><strong>${msg("emailVerifyInstruction2")}</strong></p>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">
                            ${msg("emailVerifyInstruction3")}
                        </p>
                    </div>
                </div>

                <!-- Resend email form -->
                <form id="kc-verify-email-form" action="${url.loginAction}" method="post" class="kc-form">
                    <div class="kc-form-group">
                        <input 
                            class="kc-btn kc-btn-secondary" 
                            type="submit" 
                            name="submitAction" 
                            value="${msg("doResendEmail")}"
                            style="width: 100%;"
                        />
                    </div>

                    <!-- Navigation links -->
                    <div class="kc-links">
                        <div class="kc-divider">${msg("or")}</div>
                        <a href="${url.loginUrl}" class="kc-btn-link">
                            ← ${msg("backToLogin")}
                        </a>
                    </div>
                </form>

                <!-- Help text -->
                <div style="margin-top: 2rem; text-align: center;">
                    <details style="cursor: pointer;">
                        <summary style="color: var(--text-muted); font-size: 0.875rem;">
                            ${msg("emailVerifyTrouble")}
                        </summary>
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--input); border-radius: 0.5rem; font-size: 0.875rem; color: var(--text-muted);">
                            <ul style="text-align: left; margin: 0; padding-left: 1.5rem;">
                                <li>${msg("emailVerifyTrouble1")}</li>
                                <li>${msg("emailVerifyTrouble2")}</li>
                                <li>${msg("emailVerifyTrouble3")}</li>
                            </ul>
                        </div>
                    </details>
                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Auto-refresh functionality
            let refreshInterval;
            let countdown = 30;

            function startCountdown() {
                const resendBtn = document.querySelector('input[name="submitAction"]');
                
                function updateButton() {
                    if (countdown > 0) {
                        resendBtn.value = `${msg("doResendEmail")} (${countdown}s)`;
                        resendBtn.disabled = true;
                        countdown--;
                    } else {
                        resendBtn.value = "${msg("doResendEmail")}";
                        resendBtn.disabled = false;
                        clearInterval(refreshInterval);
                    }
                }

                updateButton();
                refreshInterval = setInterval(updateButton, 1000);
            }

            // Start countdown on page load
            startCountdown();

            // Add loading state on form submission
            document.getElementById('kc-verify-email-form').addEventListener('submit', function() {
                const submitBtn = this.querySelector('input[type="submit"]');
                submitBtn.classList.add('kc-loading');
                submitBtn.disabled = true;
                
                // Reset countdown after submission
                setTimeout(() => {
                    countdown = 30;
                    startCountdown();
                }, 2000);
            });

            // Check email button functionality
            function checkEmail() {
                // This would typically refresh the page or check verification status
                window.location.reload();
            }

            // Add a "Check Email" button
            const form = document.getElementById('kc-verify-email-form');
            const checkEmailBtn = document.createElement('button');
            checkEmailBtn.type = 'button';
            checkEmailBtn.className = 'kc-btn kc-btn-primary';
            checkEmailBtn.style.width = '100%';
            checkEmailBtn.style.marginTop = '0.75rem';
            checkEmailBtn.textContent = '${msg("emailVerifyCheck")}';
            checkEmailBtn.onclick = checkEmail;
            
            form.insertBefore(checkEmailBtn, form.querySelector('.kc-links'));
        </script>
    <#elseif section = "info">
        <p class="instruction">
            ${msg("emailVerifyInstruction1")} 
            <strong>${user.email}</strong>.
        </p>
        <p class="instruction">
            ${msg("emailVerifyInstruction2")} ${msg("emailVerifyInstruction3")}
        </p>
    </#if>
</@layout.registrationLayout>