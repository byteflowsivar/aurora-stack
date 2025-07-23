<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=messagesPerField.exists('global'); section>
    <#if section = "header">
        ${msg("loginProfileTitle")}
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
                                <h1 class="kc-title">${msg("loginProfileTitle")}</h1>
                                <p class="kc-subtitle">${msg("loginProfileDescription")}</p>
                            </div>

                <!-- Messages -->
                <#if message?has_content && message.type != 'warning' && messagesPerField.exists('global')>
                    <div class="kc-message kc-message-${message.type}">
                        <span class="kc-message-summary">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <!-- Form -->
                <form id="kc-update-profile-form" action="${url.loginAction}" method="post" class="kc-form">
                    <#if user.editUsernameAllowed>
                        <div class="kc-form-group">
                            <label for="username" class="kc-label">${msg("username")}</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value="${(user.username!'')}" 
                                class="kc-input"
                                autocomplete="username"
                                placeholder="${msg("username")}"
                                aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                            />
                            <#if messagesPerField.existsError('username')>
                                <span id="input-error-username" class="kc-message kc-message-error" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('username'))?no_esc}
                                </span>
                            </#if>
                        </div>
                    </#if>

                    <div class="kc-form-group">
                        <label for="email" class="kc-label">${msg("email")}</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value="${(user.email!'')}" 
                            class="kc-input"
                            autocomplete="email"
                            placeholder="${msg("email")}"
                            aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                        />
                        <#if messagesPerField.existsError('email')>
                            <span id="input-error-email" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('email'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="kc-form-group">
                        <label for="firstName" class="kc-label">${msg("firstName")}</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            value="${(user.firstName!'')}" 
                            class="kc-input"
                            autocomplete="given-name"
                            placeholder="${msg("firstName")}"
                            aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                        />
                        <#if messagesPerField.existsError('firstName')>
                            <span id="input-error-firstName" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="kc-form-group">
                        <label for="lastName" class="kc-label">${msg("lastName")}</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            value="${(user.lastName!'')}" 
                            class="kc-input"
                            autocomplete="family-name"
                            placeholder="${msg("lastName")}"
                            aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                        />
                        <#if messagesPerField.existsError('lastName')>
                            <span id="input-error-lastName" class="kc-message kc-message-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <!-- Custom user attributes (excluding standard fields) -->
                    <#list profile.attributes as attribute>
                        <#if attribute.name != 'username' && attribute.name != 'email' && attribute.name != 'firstName' && attribute.name != 'lastName'>
                            <div class="kc-form-group">
                                <label for="${attribute.name}" class="kc-label">
                                    ${advancedMsg(attribute.displayName!'')}<#if attribute.required> *</#if>
                                </label>
                                <#if attribute.annotations.inputType?? && attribute.annotations.inputType == 'textarea'>
                                    <textarea 
                                        id="${attribute.name}" 
                                        name="${attribute.name}" 
                                        class="kc-input"
                                        rows="4"
                                        <#if attribute.readOnly>disabled</#if>
                                        <#if attribute.required>required</#if>
                                        aria-invalid="<#if messagesPerField.existsError('${attribute.name}')>true</#if>"
                                    >${(attribute.value!'')}</textarea>
                                <#else>
                                    <input 
                                        type="<#if attribute.annotations.inputType??>${attribute.annotations.inputType}<#else>text</#if>" 
                                        id="${attribute.name}" 
                                        name="${attribute.name}" 
                                        value="${(attribute.value!'')}" 
                                        class="kc-input"
                                        <#if attribute.readOnly>readonly</#if>
                                        <#if attribute.required>required</#if>
                                        <#if attribute.annotations.inputHelperTextBefore??>placeholder="${attribute.annotations.inputHelperTextBefore}"</#if>
                                        aria-invalid="<#if messagesPerField.existsError('${attribute.name}')>true</#if>"
                                    />
                                </#if>
                                <#if messagesPerField.existsError('${attribute.name}')>
                                    <span id="input-error-${attribute.name}" class="kc-message kc-message-error" aria-live="polite">
                                        ${kcSanitize(messagesPerField.get('${attribute.name}'))?no_esc}
                                    </span>
                                </#if>
                                <#if attribute.annotations.inputHelperTextAfter??>
                                    <div class="kc-input-helper-text">${attribute.annotations.inputHelperTextAfter}</div>
                                </#if>
                            </div>
                        </#if>
                    </#list>

                    <div class="kc-form-group">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Form validation
            function validateForm() {
                const requiredFields = document.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.style.borderColor = 'var(--error)';
                        isValid = false;
                    } else {
                        field.style.borderColor = 'var(--border)';
                    }
                });

                return isValid;
            }

            // Email validation
            function validateEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            // Real-time validation
            document.getElementById('email').addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    this.style.borderColor = 'var(--error)';
                } else {
                    this.style.borderColor = 'var(--border)';
                }
            });

            // Add loading state on form submission
            document.getElementById('kc-update-profile-form').addEventListener('submit', function(e) {
                if (!validateForm()) {
                    e.preventDefault();
                    return false;
                }
                
                const submitBtn = this.querySelector('input[type="submit"]');
                submitBtn.classList.add('kc-loading');
                submitBtn.disabled = true;
            });
        </script>
    </#if>
</@layout.registrationLayout>