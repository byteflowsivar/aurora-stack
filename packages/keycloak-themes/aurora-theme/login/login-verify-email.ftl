<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailVerifyTitle")}
    <#elseif section = "form">
        <div class="kc-container">
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
                <#if displayMessage && message?has_content && message.type != 'warning'>
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