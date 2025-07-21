<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">
        <div class="kc-container">
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
                <#if displayMessage && message?has_content && message.type != 'warning'>
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