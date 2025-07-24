<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
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
                                <h1 class="kc-title">${msg("updatePasswordTitle")}</h1>
                                <p class="kc-subtitle">${msg("updatePasswordDescription")}</p>
                            </div>

                <!-- Messages -->
                <#if message?has_content && message.type != 'warning' && !messagesPerField.existsError('password','password-confirm')>
                    <div class="kc-message kc-message-${message.type}">
                        <span class="kc-message-summary">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <!-- Form -->
                <form id="kc-passwd-update-form" action="${url.loginAction}" method="post" class="kc-form">
                    <div class="kc-form-group">
                        <label for="password-new" class="kc-label">${msg("passwordNew")}</label>
                        <input 
                            type="password" 
                            id="password-new" 
                            name="password-new" 
                            class="kc-input" 
                            autofocus 
                            autocomplete="new-password"
                            placeholder="${msg("passwordNew")}"
                            aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                        />
                        <#if messagesPerField.existsError('password')>
                            <span id="input-error-password" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('password'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="kc-form-group">
                        <label for="password-confirm" class="kc-label">${msg("passwordConfirm")}</label>
                        <input 
                            type="password" 
                            id="password-confirm" 
                            name="password-confirm" 
                            class="kc-input"
                            autocomplete="new-password"
                            placeholder="${msg("passwordConfirm")}"
                            aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                        />
                        <#if messagesPerField.existsError('password-confirm')>
                            <span id="input-error-password-confirm" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="kc-form-group">
                        <div id="kc-form-options">
                            <div class="${properties.kcFormOptionsWrapperClass!}">
                            </div>
                        </div>

                        <div id="kc-form-buttons">
                            <#if isAppInitiatedAction??>
                                <input 
                                    class="kc-btn kc-btn-primary" 
                                    type="submit" 
                                    value="${msg("doSubmit")}" 
                                />
                                <button 
                                    class="kc-btn kc-btn-secondary" 
                                    type="submit" 
                                    name="cancel-aia" 
                                    value="true"
                                >${msg("doCancel")}</button>
                            <#else>
                                <input 
                                    class="kc-btn kc-btn-primary" 
                                    type="submit" 
                                    value="${msg("doSubmit")}" 
                                />
                            </#if>
                        </div>
                    </div>
                </form>

                <!-- Password Requirements (if available) -->
                <#if passwordPolicy??>
                    <div class="kc-message kc-message-info">
                        <div class="kc-password-policy">
                            <strong>${msg("passwordPolicyTitle")}</strong>
                            <ul>
                                <#list passwordPolicy.requirements as requirement>
                                    <li>${requirement.description}</li>
                                </#list>
                            </ul>
                        </div>
                    </div>
                </#if>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Password strength indicator
            function checkPasswordStrength() {
                const password = document.getElementById('password-new').value;
                const confirm = document.getElementById('password-confirm').value;
                
                // Add visual feedback for password matching
                if (password && confirm) {
                    const confirmField = document.getElementById('password-confirm');
                    if (password === confirm) {
                        confirmField.style.borderColor = 'var(--success)';
                    } else {
                        confirmField.style.borderColor = 'var(--error)';
                    }
                }
            }

            // Add event listeners
            document.getElementById('password-new').addEventListener('input', checkPasswordStrength);
            document.getElementById('password-confirm').addEventListener('input', checkPasswordStrength);

            // Add loading state on form submission
            document.getElementById('kc-passwd-update-form').addEventListener('submit', function() {
                const submitBtn = this.querySelector('input[type="submit"]');
                submitBtn.classList.add('kc-loading');
                submitBtn.disabled = true;
            });
        </script>
    </#if>
</@layout.registrationLayout>