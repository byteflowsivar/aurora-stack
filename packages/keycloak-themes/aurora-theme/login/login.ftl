<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
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
                    
                    <!-- Right Column - Login Form -->
                    <div class="kc-form-panel">
                        <div class="kc-card kc-fade-in">
                            <!-- Header -->
                            <div class="kc-header">
                                <h1 class="kc-title">Bienvenido</h1>
                            </div>

                        <!-- Messages -->
                        <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                            <div class="kc-message kc-message-${message.type}">
                                <span class="kc-message-summary">${kcSanitize(message.summary)?no_esc}</span>
                            </div>
                        </#if>

                        <!-- Main Form -->
                        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="kc-form">
                            <#if !usernameHidden??>
                                <div class="kc-form-group">
                                    <label for="username" class="kc-label">
                                        <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                                    </label>
                                    <input 
                                        tabindex="1" 
                                        id="username" 
                                        class="kc-input" 
                                        name="username" 
                                        value="${(login.username!'')}" 
                                        type="text" 
                                        autofocus 
                                        autocomplete="username"
                                        placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                                        aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                    />
                                    <#if messagesPerField.existsError('username','password')>
                                        <span id="input-error" class="kc-message kc-message-error" aria-live="polite">
                                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                        </span>
                                    </#if>
                                </div>
                            </#if>

                            <div class="kc-form-group">
                                <label for="password" class="kc-label">${msg("password")}</label>
                                <input 
                                    tabindex="2" 
                                    id="password" 
                                    class="kc-input" 
                                    name="password" 
                                    type="password" 
                                    autocomplete="current-password"
                                    placeholder="${msg("password")}"
                                    aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                />
                            </div>

                            <div class="kc-form-group">
                                <#if realm.rememberMe && !usernameHidden??>
                                    <div class="kc-checkbox-wrapper">
                                        <input 
                                            tabindex="3" 
                                            id="rememberMe" 
                                            name="rememberMe" 
                                            type="checkbox" 
                                            class="kc-checkbox"
                                            <#if login.rememberMe??>checked</#if>
                                        />
                                        <label class="kc-checkbox-label" for="rememberMe">${msg("rememberMe")}</label>
                                    </div>
                                </#if>
                            </div>

                            <div class="kc-form-group">
                                <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                                <input 
                                    tabindex="4" 
                                    class="kc-btn kc-btn-primary" 
                                    name="login" 
                                    id="kc-login" 
                                    type="submit" 
                                    value="${msg("doLogIn")}"
                                />
                            </div>

                            <!-- Links -->
                            <div class="kc-links">
                                <#if realm.resetPasswordAllowed>
                                    <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="kc-btn-link">
                                        ${msg("doForgotPassword")}
                                    </a>
                                </#if>
                                <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                                    <div class="kc-divider">${msg("or")}</div>
                                    <a tabindex="6" href="${url.registrationUrl}" class="kc-btn kc-btn-secondary">
                                        ${msg("doRegister")}
                                    </a>
                                </#if>
                            </div>
                        </form>

                        <!-- Social Providers -->
                        <#if realm.password && social.providers??>
                            <div class="kc-divider">${msg("identity-provider-login-label")}</div>
                            <div class="kc-social">
                                <#list social.providers as p>
                                    <a id="social-${p.alias}" 
                                       class="kc-social-btn" 
                                       type="button" 
                                       href="${p.loginUrl}">
                                        <#if p.iconClasses?has_content>
                                            <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                            <span class="kc-sr-only">${p.displayName!}</span>
                                        </#if>
                                        <span>${msg("doLogIn")} ${p.displayName!}</span>
                                    </a>
                                </#list>
                            </div>
                        </#if>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Add loading state on form submission
            document.getElementById('kc-form-login').addEventListener('submit', function() {
                const submitBtn = document.getElementById('kc-login');
                submitBtn.classList.add('kc-loading');
                submitBtn.disabled = true;
            });

            // Auto-focus first input with error
            const errorInput = document.querySelector('.kc-input[aria-invalid="true"]');
            if (errorInput) {
                errorInput.focus();
            }
        </script>
    </#if>
</@layout.registrationLayout>