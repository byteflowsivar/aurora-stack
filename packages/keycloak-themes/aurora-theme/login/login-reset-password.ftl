<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
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
                                <h1 class="kc-title">${msg("emailForgotTitle")}</h1>
                                <p class="kc-subtitle">${msg("emailInstruction")}</p>
                            </div>

                <!-- Messages -->
                <#if message?has_content && message.type != 'warning' && !messagesPerField.existsError('username')>
                    <div class="kc-message kc-message-${message.type}">
                        <span class="kc-message-summary">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <!-- Form -->
                <form id="kc-reset-password-form" action="${url.loginAction}" method="post" class="kc-form">
                    <div class="kc-form-group">
                        <label for="username" class="kc-label">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            class="kc-input" 
                            autofocus 
                            value="${(auth.attemptedUsername!'')}"
                            autocomplete="username"
                            placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                            aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                        />
                        <#if messagesPerField.existsError('username')>
                            <span id="input-error-username" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('username'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="kc-form-group">
                        <input 
                            class="kc-btn kc-btn-primary" 
                            type="submit" 
                            value="${msg("doSubmit")}"
                        />
                    </div>

                    <!-- Back to login link -->
                    <div class="kc-links">
                        <a href="${url.loginUrl}" class="kc-btn-link">
                            ← ${msg("backToLogin")}
                        </a>
                    </div>
                </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Add loading state on form submission
            document.getElementById('kc-reset-password-form').addEventListener('submit', function() {
                const submitBtn = this.querySelector('input[type="submit"]');
                submitBtn.classList.add('kc-loading');
                submitBtn.disabled = true;
            });
        </script>
    <#elseif section = "info">
        <#if realm.duplicateEmailsAllowed>
            ${msg("emailInstructionUsername")}
        <#else>
            ${msg("emailInstruction")}
        </#if>
    </#if>
</@layout.registrationLayout>