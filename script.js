// ============================
// CONFIGURAÇÃO FIREBASE COM REALTIME DATABASE
// ============================

// VARIÁVEIS GLOBAIS
let firebaseApp = null;
let firebaseAuth = null;
let database = null;
let storage = null;

// Referências do Realtime Database
let plansRef = null;
let employeesRef = null;
let ratingsRef = null;
let configRef = null;
let usersRef = null;
let candidatesRef = null;
let preCadastrosRef = null;
let platformImagesRef = null;
let galleryRef = null;
let logoRef = null;
let appsRef = null;
let partnersRef = null;

// Estado da aplicação
const AppState = {
    currentEmployeeId: null,
    isLoggedIn: false,
    currentUser: null,
    isLoading: false,
    config: {
        // Configurações gerais
        pageTitle: "Target Fit Club Palácio",
        logoUrl: "https://i.ibb.co/wZCCmYqh/logotarget.png",
        companyName: "Target Fit Club Palácio",
        companyDescription: "Transformamos vidas através do fitness com equipamentos de última geração, profissionais qualificados e um ambiente motivador.",
        companyBiography: "",

        // Textos da página
        welcomeTitle: "Olá Seja bem Vindo a Target Fit Club Palácio",
        welcomeSubtitle: "Transforme seu corpo, transforme sua vida!",
        heroTitle: "Transforme seu corpo, transforme sua vida",
        heroDescription: "Na TARGET FIT CLUB, oferecemos os melhores equipamentos, profissionais qualificados e um ambiente motivador para você alcançar seus objetivos.",
        plansSubtitle: "Escolha o plano ideal para sua jornada fitness",
        employeesSubtitle: "Profissionais qualificados para te acompanhar",
        sidebarText: "Transforme seu corpo, transforme sua vida",

        // WhatsApp
        whatsAppNumber: "5511959749844",
        planMessage: "Olá, gostaria de informações sobre o plano [PLANO]",
        contactMessage: "Olá, gostaria de mais informações sobre a academia!",

        // Footer
        footerAddress: "Av. Giovanni Gronchi, 1060 - Morumbi",
        footerPhone: "11959749844",
        footerEmail: "Targetpalacio@gmail.com",
        footerHours: "Seg a Sexta 5:30 - 00H | Sabado 8h - 18h | Domingo 8h - 14h"
    },
    employees: [],
    plans: [],
    ratings: [],
    users: [],
    candidates: [],
    preCadastros: [],
    platformImages: [],
    galleryImages: [],
    apps: [],
    partners: [],
    currentFilter: 'all',

    // Swiper instances
    partnersSwiper: null,
    gallerySwiper: null,
    commentsSwiper: null
};

// Cache de elementos DOM
const DOMCache = {};

// ============================
// INICIALIZAÇÃO
// ============================

async function initializeApp() {
    console.log('🚀 Inicializando aplicação...');

    try {
        // 1. Mostrar intro animation
        showIntroAnimation();

        // 2. Cachear elementos DOM
        cacheDOMElements();

        // 3. Configurar event listeners
        setupEventListeners();

        // 4. Configurar ano atual no footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // 5. Configurar data máxima para nascimento (18 anos atrás)
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const birthDate = document.getElementById('birthDate');
        const preDataNascimento = document.getElementById('preDataNascimento');

        if (birthDate) birthDate.max = maxDate.toISOString().split('T')[0];
        if (preDataNascimento) preDataNascimento.max = maxDate.toISOString().split('T')[0];

        // 6. Inicializar Firebase
        const firebaseInitialized = await initializeFirebase();
        if (!firebaseInitialized) {
            console.log('⚠️ Usando dados de exemplo...');
            loadFallbackData();
            initializeSwipers();
            return;
        }

        console.log('✅ Firebase inicializado com sucesso!');

        // 7. Carregar configurações
        await loadConfig();

        // 8. Verificar autenticação
        await checkAuthState();

        // 9. Carregar dados iniciais se não estiver logado
        if (!AppState.isLoggedIn) {
            await loadInitialData();
            initializeSwipers();
        }

        console.log('🎉 Aplicação inicializada com sucesso!');

    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        loadFallbackData();
        initializeSwipers();
        showError('Erro ao inicializar a aplicação. Carregando dados de exemplo...');
    }
}

function showIntroAnimation() {
    const intro = document.getElementById('introAnimation');
    if (!intro) return;

    setTimeout(() => {
        intro.style.animation = 'introFadeOut 0.5s ease forwards';
        setTimeout(() => {
            intro.style.display = 'none';
            showWelcomeMessage();
        }, 500);
    }, 2000);
}

function showWelcomeMessage() {
    if (DOMCache.welcomeContainer) {
        DOMCache.welcomeContainer.style.display = 'block';
        setTimeout(() => {
            if (DOMCache.welcomeContainer) {
                DOMCache.welcomeContainer.style.display = 'none';
            }
        }, 5000);
    }
}

function initializeSwipers() {
    // Inicializar swiper de parcerias
    try {
        if (document.querySelector('.partners-swiper')) {
            AppState.partnersSwiper = new Swiper('.partners-swiper', {
                slidesPerView: 'auto',
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 15
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    },
                    1400: {
                        slidesPerView: 4,
                        spaceBetween: 20
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Não foi possível inicializar swiper de parcerias:', e);
    }

    // Inicializar swiper de galeria
    try {
        if (document.querySelector('.gallery-swiper')) {
            AppState.gallerySwiper = new Swiper('.gallery-swiper', {
                slidesPerView: 'auto',
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 15
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Não foi possível inicializar swiper de galeria:', e);
    }

    // Inicializar swiper de comentários
    try {
        if (document.querySelector('.comments-swiper')) {
            AppState.commentsSwiper = new Swiper('.comments-swiper', {
                slidesPerView: 'auto',
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 15
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Não foi possível inicializar swiper de comentários:', e);
    }
}

async function initializeFirebase() {
    try {
        console.log('🔥 Inicializando Firebase com Realtime Database...');

        // Verificar se Firebase está carregado
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase não está carregado!');
            return false;
        }

        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDnIzOyu7m_ifxsXh1_H-3rNwiTIQDa-V8",
            authDomain: "target-cdf0d.firebaseapp.com",
            databaseURL: "https://target-cdf0d-default-rtdb.firebaseio.com",
            projectId: "target-cdf0d",
            storageBucket: "target-cdf0d.firebasestorage.app",
            messagingSenderId: "392644772030",
            appId: "1:392644772030:web:b0e094a3ec109e59dc9eef"
        };

        // Inicializar Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        database = firebase.database();
        storage = firebase.storage();

        console.log('✅ Firebase Apps:', firebase.apps.length);
        console.log('✅ Firebase App Name:', firebaseApp.name);
        console.log('✅ Firebase Auth:', !!firebaseAuth);
        console.log('✅ Firebase Database:', !!database);
        console.log('✅ Firebase Storage:', !!storage);

        // Configurar referências do banco de dados
        plansRef = database.ref('plans');
        employeesRef = database.ref('employees');
        ratingsRef = database.ref('ratings');
        configRef = database.ref('config');
        usersRef = database.ref('users');
        candidatesRef = database.ref('candidates');
        preCadastrosRef = database.ref('preCadastros');
        platformImagesRef = database.ref('platformImages');
        galleryRef = database.ref('gallery');
        logoRef = database.ref('logo');
        appsRef = database.ref('apps');
        partnersRef = database.ref('partners');

        console.log('✅ Firebase inicializado com sucesso! Todas as referências configuradas.');
        return true;

    } catch (error) {
        console.error('❌ ERRO DETALHADO Firebase:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        return false;
    }
}

function cacheDOMElements() {
    // Elementos principais
    DOMCache.menuToggle = document.getElementById('menuToggle');
    DOMCache.sidebar = document.getElementById('sidebar');
    DOMCache.overlay = document.getElementById('overlay');
    DOMCache.closeSidebar = document.getElementById('closeSidebar');
    DOMCache.homeLogo = document.getElementById('homeLogo');
    DOMCache.welcomeContainer = document.getElementById('welcomeContainer');
    DOMCache.welcomeTitle = document.getElementById('welcomeTitle');
    DOMCache.welcomeSubtitle = document.getElementById('welcomeSubtitle');
    DOMCache.heroTitle = document.getElementById('heroTitle');
    DOMCache.heroDescription = document.getElementById('heroDescription');
    DOMCache.heroHighlight = document.getElementById('heroHighlight');
    DOMCache.plansSubtitle = document.getElementById('plansSubtitle');
    DOMCache.employeesSubtitle = document.getElementById('employeesSubtitle');
    DOMCache.sidebarFooterText = document.getElementById('sidebarFooterText');

    // Logos
    DOMCache.mainLogo = document.getElementById('mainLogo');
    DOMCache.loginLogoImg = document.getElementById('loginLogoImg');
    DOMCache.dashboardLogoImg = document.getElementById('dashboardLogoImg');
    DOMCache.footerLogoImg = document.getElementById('footerLogoImg');

    // Botão de Suporte
    DOMCache.supportBtn = document.getElementById('supportBtn');

    // Navegação
    DOMCache.whatsappBtn = document.getElementById('whatsappBtn');
    DOMCache.workWithUsSidebarBtn = document.getElementById('workWithUsSidebarBtn');
    DOMCache.preCadastroBtn = document.getElementById('preCadastroBtn');
    DOMCache.academiaFotoBtn = document.getElementById('academiaFotoBtn');
    DOMCache.dashboardBtn = document.getElementById('dashboardBtn');

    // Seções
    DOMCache.academiaGallery = document.getElementById('academiaGallery');
    DOMCache.galleryContainer = document.getElementById('galleryContainer');
    DOMCache.plansContainer = document.getElementById('plansContainer');
    DOMCache.employeesList = document.getElementById('employeesList');
    DOMCache.roleFilterContainer = document.getElementById('roleFilterContainer');
    DOMCache.platformsGrid = document.getElementById('platformsGrid');
    DOMCache.platformImagesDashboard = document.getElementById('platformImagesDashboard');
    DOMCache.galleryImagesDashboard = document.getElementById('galleryImagesDashboard');
    DOMCache.appsContainer = document.getElementById('appsContainer');
    DOMCache.appsDashboardContainer = document.getElementById('appsDashboardContainer');
    DOMCache.partnersContainer = document.getElementById('partnersContainer');
    DOMCache.partnersDashboardContainer = document.getElementById('partnersDashboardContainer');
    DOMCache.commentsContainer = document.getElementById('commentsContainer');

    // Modal Pré-cadastro
    DOMCache.preCadastroModal = document.getElementById('preCadastroModal');
    DOMCache.closePreCadastroModal = document.getElementById('closePreCadastroModal');
    DOMCache.cancelPreCadastroBtn = document.getElementById('cancelPreCadastroBtn');
    DOMCache.preCadastroForm = document.getElementById('preCadastroForm');
    DOMCache.submitPreCadastroBtn = document.getElementById('submitPreCadastroBtn');
    DOMCache.submitPreCadastroText = document.getElementById('submitPreCadastroText');
    DOMCache.submitPreCadastroLoading = document.getElementById('submitPreCadastroLoading');

    // Modal de avaliação
    DOMCache.ratingModal = document.getElementById('ratingModal');
    DOMCache.closeRatingModal = document.getElementById('closeRatingModal');
    DOMCache.cancelRatingBtn = document.getElementById('cancelRatingBtn');
    DOMCache.ratingForm = document.getElementById('ratingForm');
    DOMCache.ratingEmployeeInfo = document.getElementById('ratingEmployeeInfo');
    DOMCache.submitRatingBtn = document.getElementById('submitRatingBtn');
    DOMCache.submitRatingText = document.getElementById('submitRatingText');
    DOMCache.submitRatingLoading = document.getElementById('submitRatingLoading');

    // Modal de comentários
    DOMCache.commentsModal = document.getElementById('commentsModal');
    DOMCache.closeCommentsModal = document.getElementById('closeCommentsModal');
    DOMCache.closeCommentsBtn = document.getElementById('closeCommentsBtn');
    DOMCache.commentsModalTitle = document.getElementById('commentsModalTitle');
    DOMCache.commentsModalSubtitle = document.getElementById('commentsModalSubtitle');
    DOMCache.commentsEmployeeInfo = document.getElementById('commentsEmployeeInfo');
    DOMCache.commentsList = document.getElementById('commentsList');

    // Modal trabalhe conosco
    DOMCache.workModal = document.getElementById('workModal');
    DOMCache.closeWorkModal = document.getElementById('closeWorkModal');
    DOMCache.closeWorkOptionsBtn = document.getElementById('closeWorkOptionsBtn');
    DOMCache.workOptions = document.querySelectorAll('.work-option');

    // Modal formulário trabalhe conosco
    DOMCache.workFormModal = document.getElementById('workFormModal');
    DOMCache.closeWorkFormModal = document.getElementById('closeWorkFormModal');
    DOMCache.cancelWorkFormBtn = document.getElementById('cancelWorkFormBtn');
    DOMCache.workForm = document.getElementById('workForm');
    DOMCache.submitWorkFormBtn = document.getElementById('submitWorkFormBtn');
    DOMCache.submitWorkFormText = document.getElementById('submitWorkFormText');
    DOMCache.submitWorkFormLoading = document.getElementById('submitWorkFormLoading');
    DOMCache.selectedRole = document.getElementById('selectedRole');

    // Modal de configurações
    DOMCache.configModal = document.getElementById('configModal');
    DOMCache.closeConfigModal = document.getElementById('closeConfigModal');
    DOMCache.cancelConfigBtn = document.getElementById('cancelConfigBtn');
    DOMCache.openConfigBtn = document.getElementById('openConfigBtn');
    DOMCache.configForm = document.getElementById('configForm');
    DOMCache.saveConfigBtn = document.getElementById('saveConfigBtn');
    DOMCache.saveConfigText = document.getElementById('saveConfigText');
    DOMCache.saveConfigLoading = document.getElementById('saveConfigLoading');
    DOMCache.uploadLogoBtn = document.getElementById('uploadLogoBtn');
    DOMCache.logoUploadInput = document.getElementById('logoUploadInput');
    DOMCache.logoPreviewImage = document.getElementById('logoPreviewImage');
    DOMCache.addPlatformImageBtn = document.getElementById('addPlatformImageBtn');
    DOMCache.removePlatformImageBtn = document.getElementById('removePlatformImageBtn');
    DOMCache.addPlatformImageDashboardBtn = document.getElementById('addPlatformImageDashboardBtn');
    DOMCache.removePlatformImageDashboardBtn = document.getElementById('removePlatformImageDashboardBtn');
    DOMCache.uploadGalleryBtn = document.getElementById('uploadGalleryBtn');
    DOMCache.galleryUploadInput = document.getElementById('galleryUploadInput');
    DOMCache.clearGalleryBtn = document.getElementById('clearGalleryBtn');
    DOMCache.uploadGalleryDashboardBtn = document.getElementById('uploadGalleryDashboardBtn');
    DOMCache.galleryDashboardUpload = document.getElementById('galleryDashboardUpload');
    DOMCache.clearGalleryDashboardBtn = document.getElementById('clearGalleryDashboardBtn');
    DOMCache.addMorePlatformsBtn = document.getElementById('addMorePlatformsBtn');
    DOMCache.addAppBtn = document.getElementById('addAppBtn');
    DOMCache.addAppDashboardBtn = document.getElementById('addAppDashboardBtn');
    DOMCache.addPartnerBtn = document.getElementById('addPartnerBtn');
    DOMCache.addPartnerDashboardBtn = document.getElementById('addPartnerDashboardBtn');

    // Modal de Plano
    DOMCache.planModal = document.getElementById('planModal');
    DOMCache.closePlanModal = document.getElementById('closePlanModal');
    DOMCache.planForm = document.getElementById('planForm');
    DOMCache.cancelPlanBtn = document.getElementById('cancelPlanBtn');
    DOMCache.savePlanBtn = document.getElementById('savePlanBtn');
    DOMCache.savePlanText = document.getElementById('savePlanText');
    DOMCache.savePlanLoading = document.getElementById('savePlanLoading');
    DOMCache.planModalTitle = document.getElementById('planModalTitle');
    DOMCache.planModalSubtitle = document.getElementById('planModalSubtitle');

    // Modal de Funcionário
    DOMCache.employeeModal = document.getElementById('employeeModal');
    DOMCache.closeEmployeeModal = document.getElementById('closeEmployeeModal');
    DOMCache.employeeForm = document.getElementById('employeeForm');
    DOMCache.cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
    DOMCache.saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    DOMCache.saveEmployeeText = document.getElementById('saveEmployeeText');
    DOMCache.saveEmployeeLoading = document.getElementById('saveEmployeeLoading');
    DOMCache.employeeModalTitle = document.getElementById('employeeModalTitle');
    DOMCache.employeeModalSubtitle = document.getElementById('employeeModalSubtitle');
    DOMCache.uploadEmployeePhotoBtn = document.getElementById('uploadEmployeePhotoBtn');
    DOMCache.employeePhotoUpload = document.getElementById('employeePhotoUpload');
    DOMCache.employeePreviewImage = document.getElementById('employeePreviewImage');
    DOMCache.employeePhotoUrl = document.getElementById('employeePhotoUrl');

    // Modal de Candidato
    DOMCache.candidateModal = document.getElementById('candidateModal');
    DOMCache.closeCandidateModal = document.getElementById('closeCandidateModal');
    DOMCache.candidateRole = document.getElementById('candidateRole');
    DOMCache.candidateInfo = document.getElementById('candidateInfo');
    DOMCache.closeCandidateBtn = document.getElementById('closeCandidateBtn');
    DOMCache.whatsappCandidateBtn = document.getElementById('whatsappCandidateBtn');

    // Login
    DOMCache.loginContainer = document.getElementById('loginContainer');
    DOMCache.loginForm = document.getElementById('loginForm');
    DOMCache.loginError = document.getElementById('loginError');
    DOMCache.loginBtn = document.getElementById('loginBtn');
    DOMCache.loginText = document.getElementById('loginText');
    DOMCache.loginLoading = document.getElementById('loginLoading');

    // Dashboard
    DOMCache.dashboard = document.getElementById('dashboard');
    DOMCache.logoutBtn = document.getElementById('logoutBtn');
    DOMCache.dashboardLogo = document.getElementById('dashboardLogo');
    DOMCache.userAvatar = document.getElementById('userAvatar');
    DOMCache.userEmail = document.getElementById('userEmail');
    DOMCache.dashboardSidebar = document.getElementById('dashboardSidebar');
    DOMCache.dashboardMenuItems = document.querySelectorAll('.dashboard-menu-item');

    // Abas do Dashboard
    DOMCache.dashboardPlansList = document.getElementById('dashboardPlansList');
    DOMCache.dashboardEmployeesList = document.getElementById('dashboardEmployeesList');
    DOMCache.dashboardCommentsList = document.getElementById('dashboardCommentsList');
    DOMCache.candidatesList = document.getElementById('candidatesList');
    DOMCache.preCadastrosList = document.getElementById('preCadastrosList');
    DOMCache.filterComments = document.getElementById('filterComments');
    DOMCache.clearFilterBtn = document.getElementById('clearFilterBtn');

    // Botões do Dashboard
    DOMCache.addPlanBtn = document.getElementById('addPlanBtn');
    DOMCache.addEmployeeBtn = document.getElementById('addEmployeeBtn');

    // Footer
    DOMCache.footerDescription = document.getElementById('footerDescription');
    DOMCache.footerAddress = document.getElementById('footerAddress');
    DOMCache.footerPhone = document.getElementById('footerPhone');
    DOMCache.footerEmail = document.getElementById('footerEmail');
    DOMCache.footerHours = document.getElementById('footerHours');
    DOMCache.sidebarTitle = document.getElementById('sidebarTitle');
    DOMCache.pageTitle = document.getElementById('pageTitle');

    // Botão Target no footer
    DOMCache.targetLink = document.getElementById('targetLink');
}

function setupEventListeners() {
    // Menu lateral
    if (DOMCache.menuToggle) DOMCache.menuToggle.addEventListener('click', openSidebar);
    if (DOMCache.closeSidebar) DOMCache.closeSidebar.addEventListener('click', closeSidebar);
    if (DOMCache.overlay) DOMCache.overlay.addEventListener('click', closeSidebar);
    if (DOMCache.homeLogo) DOMCache.homeLogo.addEventListener('click', () => scrollToSection('hero'));

    // Botão de Suporte
    if (DOMCache.supportBtn) DOMCache.supportBtn.addEventListener('click', () => openWhatsApp('contact'));

    // Navegação
    if (DOMCache.whatsappBtn) {
        DOMCache.whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            openWhatsApp('contact');
        });
    }

    if (DOMCache.workWithUsSidebarBtn) {
        DOMCache.workWithUsSidebarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            openWorkModal();
        });
    }

    if (DOMCache.preCadastroBtn) {
        DOMCache.preCadastroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            openPreCadastroModal();
        });
    }

    if (DOMCache.academiaFotoBtn) {
        DOMCache.academiaFotoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            scrollToSection('academiaGallery');
        });
    }

    if (DOMCache.dashboardBtn) {
        DOMCache.dashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            if (AppState.isLoggedIn) {
                showDashboard();
            } else {
                showLogin();
            }
        });
    }

    // Modal Pré-cadastro
    if (DOMCache.closePreCadastroModal) DOMCache.closePreCadastroModal.addEventListener('click', closePreCadastroModal);
    if (DOMCache.cancelPreCadastroBtn) DOMCache.cancelPreCadastroBtn.addEventListener('click', closePreCadastroModal);
    if (DOMCache.preCadastroForm) DOMCache.preCadastroForm.addEventListener('submit', handlePreCadastroSubmit);

    // CEP Auto-complete
    const preCEP = document.getElementById('preCEP');
    if (preCEP) preCEP.addEventListener('blur', buscarCEP);

    // Modal de avaliação
    if (DOMCache.closeRatingModal) DOMCache.closeRatingModal.addEventListener('click', closeRatingModal);
    if (DOMCache.cancelRatingBtn) DOMCache.cancelRatingBtn.addEventListener('click', closeRatingModal);
    if (DOMCache.ratingForm) DOMCache.ratingForm.addEventListener('submit', handleRatingSubmit);

    // Modal de comentários
    if (DOMCache.closeCommentsModal) DOMCache.closeCommentsModal.addEventListener('click', closeCommentsModal);
    if (DOMCache.closeCommentsBtn) DOMCache.closeCommentsBtn.addEventListener('click', closeCommentsModal);

    // Modal trabalhe conosco
    if (DOMCache.closeWorkModal) DOMCache.closeWorkModal.addEventListener('click', closeWorkModal);
    if (DOMCache.closeWorkOptionsBtn) DOMCache.closeWorkOptionsBtn.addEventListener('click', closeWorkModal);

    // Opções de trabalho
    if (DOMCache.workOptions) {
        DOMCache.workOptions.forEach(option => {
            option.addEventListener('click', () => {
                const role = option.dataset.role;
                openWorkFormModal(role);
            });
        });
    }

    // Modal formulário trabalhe conosco
    if (DOMCache.closeWorkFormModal) DOMCache.closeWorkFormModal.addEventListener('click', closeWorkFormModal);
    if (DOMCache.cancelWorkFormBtn) DOMCache.cancelWorkFormBtn.addEventListener('click', closeWorkFormModal);
    if (DOMCache.workForm) DOMCache.workForm.addEventListener('submit', handleWorkFormSubmit);

    // Modal de configurações
    if (DOMCache.openConfigBtn) DOMCache.openConfigBtn.addEventListener('click', openConfigModal);
    if (DOMCache.closeConfigModal) DOMCache.closeConfigModal.addEventListener('click', closeConfigModal);
    if (DOMCache.cancelConfigBtn) DOMCache.cancelConfigBtn.addEventListener('click', closeConfigModal);
    if (DOMCache.configForm) DOMCache.configForm.addEventListener('submit', handleConfigSubmit);
    if (DOMCache.uploadLogoBtn) DOMCache.uploadLogoBtn.addEventListener('click', () => DOMCache.logoUploadInput.click());
    if (DOMCache.logoUploadInput) DOMCache.logoUploadInput.addEventListener('change', handleLogoUpload);
    if (DOMCache.uploadGalleryBtn) DOMCache.uploadGalleryBtn.addEventListener('click', () => DOMCache.galleryUploadInput.click());
    if (DOMCache.galleryUploadInput) DOMCache.galleryUploadInput.addEventListener('change', handleGalleryUpload);
    if (DOMCache.clearGalleryBtn) DOMCache.clearGalleryBtn.addEventListener('click', clearGallery);
    if (DOMCache.addMorePlatformsBtn) DOMCache.addMorePlatformsBtn.addEventListener('click', addPlatformImageFromDashboard);

    // Botões de gerenciamento de imagens de plataformas
    if (DOMCache.addPlatformImageBtn) DOMCache.addPlatformImageBtn.addEventListener('click', addPlatformImage);
    if (DOMCache.removePlatformImageBtn) DOMCache.removePlatformImageBtn.addEventListener('click', removePlatformImage);
    if (DOMCache.addPlatformImageDashboardBtn) DOMCache.addPlatformImageDashboardBtn.addEventListener('click', addPlatformImageFromDashboard);
    if (DOMCache.removePlatformImageDashboardBtn) DOMCache.removePlatformImageDashboardBtn.addEventListener('click', removePlatformImageFromDashboard);

    // Galeria Dashboard
    if (DOMCache.uploadGalleryDashboardBtn) DOMCache.uploadGalleryDashboardBtn.addEventListener('click', () => DOMCache.galleryDashboardUpload.click());
    if (DOMCache.galleryDashboardUpload) DOMCache.galleryDashboardUpload.addEventListener('change', handleGalleryUploadDashboard);
    if (DOMCache.clearGalleryDashboardBtn) DOMCache.clearGalleryDashboardBtn.addEventListener('click', clearGalleryDashboard);

    // Apps
    if (DOMCache.addAppBtn) DOMCache.addAppBtn.addEventListener('click', () => addApp());
    if (DOMCache.addAppDashboardBtn) DOMCache.addAppDashboardBtn.addEventListener('click', () => addApp());

    // Parcerias
    if (DOMCache.addPartnerBtn) DOMCache.addPartnerBtn.addEventListener('click', () => addPartner());
    if (DOMCache.addPartnerDashboardBtn) DOMCache.addPartnerDashboardBtn.addEventListener('click', () => addPartner());

    // Config tabs
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchConfigTab(tabId);
        });
    });

    // Estrelas de avaliação
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('rating-star-large')) {
            const value = parseInt(e.target.getAttribute('data-value'));
            setRating(value);
        }
    });

    // Login
    if (DOMCache.loginForm) DOMCache.loginForm.addEventListener('submit', handleLogin);

    // Dashboard
    if (DOMCache.logoutBtn) DOMCache.logoutBtn.addEventListener('click', handleLogout);
    if (DOMCache.dashboardLogo) {
        DOMCache.dashboardLogo.addEventListener('click', () => {
            if (AppState.isLoggedIn) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Menu lateral do dashboard
    if (DOMCache.dashboardMenuItems) {
        DOMCache.dashboardMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                switchTab(tab);
            });
        });
    }

    // Filtros de busca
    if (DOMCache.filterComments) DOMCache.filterComments.addEventListener('input', filterComments);
    if (DOMCache.clearFilterBtn) DOMCache.clearFilterBtn.addEventListener('click', () => {
        DOMCache.filterComments.value = '';
        filterComments();
    });

    // Botões do Dashboard
    if (DOMCache.addPlanBtn) DOMCache.addPlanBtn.addEventListener('click', () => openPlanModal());
    if (DOMCache.addEmployeeBtn) DOMCache.addEmployeeBtn.addEventListener('click', () => openEmployeeModal());

    // Modal de Plano
    if (DOMCache.closePlanModal) DOMCache.closePlanModal.addEventListener('click', closePlanModal);
    if (DOMCache.cancelPlanBtn) DOMCache.cancelPlanBtn.addEventListener('click', closePlanModal);
    if (DOMCache.planForm) DOMCache.planForm.addEventListener('submit', handlePlanSubmit);

    // Modal de Funcionário
    if (DOMCache.closeEmployeeModal) DOMCache.closeEmployeeModal.addEventListener('click', closeEmployeeModal);
    if (DOMCache.cancelEmployeeBtn) DOMCache.cancelEmployeeBtn.addEventListener('click', closeEmployeeModal);
    if (DOMCache.employeeForm) DOMCache.employeeForm.addEventListener('submit', handleEmployeeSubmit);
    if (DOMCache.uploadEmployeePhotoBtn) DOMCache.uploadEmployeePhotoBtn.addEventListener('click', () => DOMCache.employeePhotoUpload.click());
    if (DOMCache.employeePhotoUpload) DOMCache.employeePhotoUpload.addEventListener('change', handleEmployeePhotoUpload);

    // Modal de Candidato
    if (DOMCache.closeCandidateModal) DOMCache.closeCandidateModal.addEventListener('click', closeCandidateModal);
    if (DOMCache.closeCandidateBtn) DOMCache.closeCandidateBtn.addEventListener('click', closeCandidateModal);
    if (DOMCache.whatsappCandidateBtn) {
        DOMCache.whatsappCandidateBtn.addEventListener('click', () => {
            const phone = DOMCache.whatsappCandidateBtn.dataset.phone;
            if (phone) {
                openCandidateWhatsApp(phone);
            }
        });
    }

    // Event listeners para cliques dinâmicos
    document.addEventListener('click', handleDynamicClickEvents);

    // Botão Target no footer
    if (DOMCache.targetLink) {
        DOMCache.targetLink.addEventListener('click', handleTargetClick);
    }
}

// ============================
// FUNÇÕES PARA OS BOTÕES SOLICITADOS
// ============================

function handleTargetClick(e) {
    e.preventDefault();
    if (AppState.isLoggedIn) {
        // Se já estiver logado, vá direto para o dashboard
        showDashboard();
    } else {
        // Se não estiver logado, mostre a tela de login
        showLogin();
    }
}

// ============================
// FUNÇÕES DE LOGO E IMAGENS (ImgBB)
// ============================

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Mostrar pré-visualização
    const reader = new FileReader();
    reader.onload = function(e) {
        if (DOMCache.logoPreviewImage) {
            DOMCache.logoPreviewImage.src = e.target.result;
            DOMCache.logoPreviewImage.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);

    // Upload para ImgBB
    try {
        const imageUrl = await uploadImageToImgBB(file);
        const configLogoUrl = document.getElementById('configLogoUrl');
        if (configLogoUrl) configLogoUrl.value = imageUrl;
        showSuccess('Logo carregado com sucesso! Clique em "Salvar Configurações" para atualizar.');
    } catch (error) {
        console.error('❌ Erro ao fazer upload do logo:', error);
        showError('Erro ao fazer upload da imagem');
    }
}

async function uploadImageToImgBB(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post('https://api.imgbb.com/1/upload?key=1dc13f6855e5552e7149a2f706a18a42', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            return response.data.data.url;
        } else {
            throw new Error('Falha no upload para ImgBB');
        }
    } catch (error) {
        console.error('❌ Erro ao fazer upload para ImgBB:', error);
        throw error;
    }
}

// ============================
// GALERIA DA ACADEMIA
// ============================

async function loadGalleryImages() {
    try {
        if (!galleryRef) return;

        galleryRef.on('value', (snapshot) => {
            AppState.galleryImages = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.galleryImages.push({ id: key, ...data[key] });
                });

                // Ordenar por ordem
                AppState.galleryImages.sort((a, b) => (a.order || 0) - (b.order || 0));
            }

            updateGalleryUI();

            if (AppState.isLoggedIn) {
                renderDashboardGallery();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar imagens da galeria:', error);
    }
}

function updateGalleryUI() {
    // Atualizar galeria na página principal
    if (DOMCache.academiaGallery && DOMCache.academiaFotoBtn) {
        if (AppState.galleryImages.length > 0) {
            DOMCache.academiaGallery.style.display = 'block';
            DOMCache.academiaFotoBtn.style.display = 'block';

            let galleryHtml = '';
            AppState.galleryImages.forEach((image, index) => {
                galleryHtml += `
                    <div class="swiper-slide">
                        <img src="${image.url}" alt="Academia ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">
                    </div>
                `;
            });

            if (DOMCache.galleryContainer) {
                DOMCache.galleryContainer.innerHTML = galleryHtml;
            }

            // Atualizar swiper
            if (AppState.gallerySwiper) {
                AppState.gallerySwiper.update();
            }
        } else {
            DOMCache.academiaGallery.style.display = 'none';
            DOMCache.academiaFotoBtn.style.display = 'none';
        }
    }
}

async function handleGalleryUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
        showSuccess('Upload em andamento...');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageUrl = await uploadImageToImgBB(file);

            const galleryItemRef = galleryRef.push();
            await galleryItemRef.set({
                url: imageUrl,
                createdAt: Date.now(),
                order: AppState.galleryImages.length + i
            });
        }

        showSuccess('Imagens da galeria carregadas com sucesso!');
        loadGalleryImages();
    } catch (error) {
        console.error('❌ Erro ao fazer upload para a galeria:', error);
        showError('Erro ao fazer upload das imagens');
    }
}

async function handleGalleryUploadDashboard(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
        showSuccess('Upload em andamento...');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageUrl = await uploadImageToImgBB(file);

            const galleryItemRef = galleryRef.push();
            await galleryItemRef.set({
                url: imageUrl,
                createdAt: Date.now(),
                order: AppState.galleryImages.length + i
            });
        }

        showSuccess('Imagens da galeria carregadas com sucesso!');
        loadGalleryImages();
        if (DOMCache.galleryDashboardUpload) DOMCache.galleryDashboardUpload.value = '';
    } catch (error) {
        console.error('❌ Erro ao fazer upload para a galeria:', error);
        showError('Erro ao fazer upload das imagens');
    }
}

async function clearGallery() {
    if (!confirm("Tem certeza que deseja limpar todas as imagens da galeria?")) return;

    try {
        await galleryRef.remove();
        showSuccess('Galeria limpa com sucesso!');
        loadGalleryImages();
    } catch (error) {
        console.error('❌ Erro ao limpar galeria:', error);
        showError('Erro ao limpar galeria');
    }
}

async function clearGalleryDashboard() {
    if (!confirm("Tem certeza que deseja limpar todas as imagens da galeria?")) return;

    try {
        await galleryRef.remove();
        showSuccess('Galeria limpa com sucesso!');
        loadGalleryImages();
    } catch (error) {
        console.error('❌ Erro ao limpar galeria:', error);
        showError('Erro ao limpar galeria');
    }
}

async function deleteGalleryImage(imageId) {
    if (!confirm("Tem certeza que deseja excluir esta imagem da galeria?")) return;

    try {
        await galleryRef.child(imageId).remove();
        showSuccess('Imagem da galeria excluída com sucesso!');
        loadGalleryImages();
    } catch (error) {
        console.error('❌ Erro ao excluir imagem da galeria:', error);
        showError('Erro ao excluir imagem');
    }
}

function renderDashboardGallery() {
    if (!DOMCache.galleryImagesDashboard) return;

    let html = '';

    if (AppState.galleryImages.length > 0) {
        AppState.galleryImages.forEach(image => {
            html += `
                <div class="gallery-image-item">
                    <img src="${image.url}" alt="Galeria" class="gallery-dashboard-img">
                    <div class="gallery-image-actions">
                        <button class="btn-action btn-delete" data-action="deleteGalleryImage" data-id="${image.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-center">Nenhuma imagem na galeria.</p>';
    }

    DOMCache.galleryImagesDashboard.innerHTML = html;
}

// ============================
// APPS (ÍCONES DE APLICATIVO)
// ============================

async function loadApps() {
    try {
        if (!appsRef) return;

        appsRef.on('value', (snapshot) => {
            AppState.apps = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.apps.push({ id: key, ...data[key] });
                });

                // Ordenar por ordem
                AppState.apps.sort((a, b) => (a.order || 0) - (b.order || 0));
            }

            // Se não houver apps, carregar os padrões
            if (AppState.apps.length === 0) {
                loadDefaultApps();
            }

            updateAppsUI();

            if (AppState.isLoggedIn) {
                renderDashboardApps();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar apps:', error);
        loadDefaultApps();
    }
}

function loadDefaultApps() {
    // Apps padrão fornecidos
    const defaultApps = [
        {
            name: "WellHub",
            icon: "https://i.ibb.co/jkq0QvRz/image.png",
            link: "#"
        },
        {
            name: "Gurupass",
            icon: "https://i.ibb.co/P8X8wZd/image.png",
            link: "#"
        },
        {
            name: "Classpass",
                icon: "https://i.ibb.co/mr5mfCXs/IMG-4865.jpg",
                link: "#"
            },
            {
            name: "TotalPass",
            icon: "https://i.ibb.co/3mq28dkr/IMG-4864.jpg",
            link: "#"
        }
    ];

    AppState.apps = defaultApps.map((app, index) => ({
        id: `app${index + 1}`,
        ...app,
        order: index
    }));
}

function updateAppsUI() {
    // Atualizar container de apps
    if (DOMCache.appsContainer) {
        let html = '';
        AppState.apps.forEach(app => {
            html += `
                <a href="${app.link}" target="_blank" class="app-item">
                    <img src="${app.icon}" alt="${app.name}" class="app-icon">
                    <span class="app-name">${app.name}</span>
                </a>
            `;
        });
        DOMCache.appsContainer.innerHTML = html;
    }
}

async function addApp() {
    try {
        const name = prompt("Nome do app:");
        if (!name) return;

        const link = prompt("Link do app:", "#");
        if (!link) return;

        // Upload da imagem do app
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const iconUrl = await uploadImageToImgBB(file);
                const appNumber = AppState.apps.length + 1;
                const appKey = `app${appNumber}`;

                await appsRef.child(appKey).set({
                    name: name,
                    icon: iconUrl,
                    link: link,
                    order: appNumber - 1,
                    createdAt: Date.now()
                });

                showSuccess('App adicionado com sucesso!');
                loadApps();
            } catch (error) {
                console.error('❌ Erro ao adicionar app:', error);
                showError('Erro ao adicionar app');
            }
        };

        fileInput.click();
    } catch (error) {
        console.error('❌ Erro ao adicionar app:', error);
        showError('Erro ao adicionar app');
    }
}

async function deleteApp(appId) {
    if (!confirm("Tem certeza que deseja excluir este app?")) return;

    try {
        await appsRef.child(appId).remove();
        showSuccess('App excluído com sucesso!');
        loadApps();
    } catch (error) {
        console.error('❌ Erro ao excluir app:', error);
        showError('Erro ao excluir app');
    }
}

function renderDashboardApps() {
    if (!DOMCache.appsDashboardContainer) return;

    let html = '';

    if (AppState.apps.length > 0) {
        AppState.apps.forEach(app => {
            html += `
                <div class="app-dashboard-item">
                    <img src="${app.icon}" alt="${app.name}" class="app-dashboard-icon">
                    <h4>${app.name}</h4>
                    <p><a href="${app.link}" target="_blank">${app.link}</a></p>
                    <div class="app-dashboard-actions">
                        <button class="btn-action btn-delete" data-action="deleteApp" data-id="${app.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-center">Nenhum app cadastrado.</p>';
    }

    DOMCache.appsDashboardContainer.innerHTML = html;
}

// ============================
// PARCERIAS
// ============================

async function loadPartners() {
    try {
        if (!partnersRef) return;

        partnersRef.on('value', (snapshot) => {
            AppState.partners = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.partners.push({ id: key, ...data[key] });
                });

                // Ordenar por verificação (Instagram primeiro) e ordem
                AppState.partners.sort((a, b) => {
                    if (a.instagram && !b.instagram) return -1;
                    if (!a.instagram && b.instagram) return 1;
                    return (a.order || 0) - (b.order || 0);
                });
            }

            updatePartnersUI();

            if (AppState.isLoggedIn) {
                renderDashboardPartners();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar parcerias:', error);
    }
}

function updatePartnersUI() {
    // Atualizar container de parcerias
    if (DOMCache.partnersContainer) {
        let html = '';

        if (AppState.partners.length > 0) {
            AppState.partners.forEach(partner => {
                html += `
                    <div class="swiper-slide">
                        <div class="partner-card">
                            <img src="${partner.logo}" alt="${partner.name}" class="partner-logo">
                            <div class="partner-name">
                                ${partner.name}
                                ${partner.instagram ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            </div>
                            <p class="partner-description">${partner.description || 'Nossa parceira oficial'}</p>
                            <a href="${partner.link}" target="_blank" class="partner-link">
                                <i class="fas fa-external-link-alt"></i> Visitar
                            </a>
                        </div>
                    </div>
                `;
            });
        }

        DOMCache.partnersContainer.innerHTML = html;

        // Atualizar swiper
        if (AppState.partnersSwiper) {
            AppState.partnersSwiper.update();
        }

        // Mostrar/ocultar a seção de parcerias
        const partnersSection = document.querySelector('.partners-section');
        if (partnersSection) {
            if (AppState.partners.length > 0) {
                partnersSection.style.display = 'block';
            } else {
                partnersSection.style.display = 'none';
            }
        }
    }
}

async function addPartner() {
    try {
        const name = prompt("Nome da empresa parceira:");
        if (!name) return;

        const description = prompt("Descrição da parceria:", "Nossa parceira oficial");
        const link = prompt("Link da parceria:", "https://");
        if (!link) return;

        const instagram = confirm("É uma parceria do Instagram?");

        // Upload da logo da parceria
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const logoUrl = await uploadImageToImgBB(file);
                const partnerNumber = AppState.partners.length + 1;
                const partnerKey = `partner${partnerNumber}`;

                await partnersRef.child(partnerKey).set({
                    name: name,
                    logo: logoUrl,
                    description: description,
                    link: link,
                    instagram: instagram,
                    order: partnerNumber - 1,
                    createdAt: Date.now()
                });

                showSuccess('Parceria adicionada com sucesso!');
                loadPartners();
            } catch (error) {
                console.error('❌ Erro ao adicionar parceria:', error);
                showError('Erro ao adicionar parceria');
            }
        };

        fileInput.click();
    } catch (error) {
        console.error('❌ Erro ao adicionar parceria:', error);
        showError('Erro ao adicionar parceria');
    }
}

async function deletePartner(partnerId) {
    if (!confirm("Tem certeza que deseja excluir esta parceria?")) return;

    try {
        await partnersRef.child(partnerId).remove();
        showSuccess('Parceria excluída com sucesso!');
        loadPartners();
    } catch (error) {
        console.error('❌ Erro ao excluir parceria:', error);
        showError('Erro ao excluir parceria');
    }
}

function renderDashboardPartners() {
    if (!DOMCache.partnersDashboardContainer) return;

    let html = '';

    if (AppState.partners.length > 0) {
        AppState.partners.forEach(partner => {
            html += `
                <div class="partner-dashboard-item">
                    <div class="partner-dashboard-header">
                        <img src="${partner.logo}" alt="${partner.name}" class="partner-dashboard-logo">
                        <div>
                            <h4>${partner.name}</h4>
                            <p>${partner.instagram ? '<i class="fas fa-check-circle verified-badge"></i> Instagram' : 'Parceria'}</p>
                        </div>
                    </div>
                    <p>${partner.description || 'Nossa parceira oficial'}</p>
                    <p><strong>Link:</strong> <a href="${partner.link}" target="_blank">${partner.link}</a></p>
                    <div class="dashboard-plan-actions">
                        <button class="btn-action btn-delete" data-action="deletePartner" data-id="${partner.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-center">Nenhuma parceria cadastrada.</p>';
    }

    DOMCache.partnersDashboardContainer.innerHTML = html;
}

// ============================
// PLATAFORMAS ACEITAS
// ============================

async function loadPlatformImages() {
    try {
        if (!platformImagesRef) return;

        platformImagesRef.on('value', (snapshot) => {
            AppState.platformImages = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.platformImages.push({ id: key, url: data[key] });
                });
            }

            // Se não houver imagens, carregar as padrões
            if (AppState.platformImages.length === 0) {
                loadDefaultPlatformImages();
            }

            updatePlatformImagesUI();
            updatePlatformImagesConfigUI();

            if (AppState.isLoggedIn) {
                renderDashboardPlatformImages();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar imagens das plataformas:', error);
        loadDefaultPlatformImages();
    }
}

function loadDefaultPlatformImages() {
    // Imagens padrão fornecidas
    const defaultImages = [
        "https://i.ibb.co/jkq0QvRz/image.png",
        "https://i.ibb.co/P8X8wZd/image.png",
        "https://i.ibb.co/W4N5VmFN/image.png"
    ];

    AppState.platformImages = defaultImages.map((url, index) => ({
        id: `platform${index + 1}`,
        url: url
    }));
}

function updatePlatformImagesUI() {
    // Atualizar grid de plataformas
    if (DOMCache.platformsGrid) {
        let html = '';
        AppState.platformImages.forEach((platform, index) => {
            html += `
                <div class="platform-item">
                    <img src="${platform.url}" alt="Plataforma ${index + 1}" class="platform-img-grid">
                </div>
            `;
        });
        DOMCache.platformsGrid.innerHTML = html;

        // Mostrar/ocultar botão "Adicionar mais"
        if (DOMCache.addMorePlatformsBtn) {
            if (AppState.platformImages.length >= 3) {
                DOMCache.addMorePlatformsBtn.style.display = 'block';
            } else {
                DOMCache.addMorePlatformsBtn.style.display = 'none';
            }
        }
    }
}

function updatePlatformImagesConfigUI() {
    // Atualizar lista de plataformas no modal de configurações
    const configList = document.getElementById('platformsConfigList');
    if (configList) {
        let html = '';
        if (AppState.platformImages.length > 0) {
            AppState.platformImages.forEach((platform, index) => {
                html += `
                    <div class="platform-config-item">
                        <img src="${platform.url}" alt="Plataforma ${index + 1}" class="platform-config-img">
                        <p>Plataforma ${index + 1}</p>
                    </div>
                `;
            });
        } else {
            html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma imagem de plataforma cadastrada.</p>';
        }
        configList.innerHTML = html;
    }
}

async function addPlatformImage() {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const imageUrl = await uploadImageToImgBB(file);
                const platformNumber = AppState.platformImages.length + 1;
                const platformKey = `platform${platformNumber}`;

                await platformImagesRef.child(platformKey).set(imageUrl);
                showSuccess('Imagem de plataforma adicionada com sucesso!');
                loadPlatformImages();
            } catch (error) {
                console.error('❌ Erro ao adicionar imagem de plataforma:', error);
                showError('Erro ao adicionar imagem');
            }
        };

        fileInput.click();
    } catch (error) {
        console.error('❌ Erro ao adicionar imagem:', error);
        showError('Erro ao adicionar imagem');
    }
}

async function addPlatformImageFromDashboard() {
    await addPlatformImage();
}

async function removePlatformImage() {
    if (AppState.platformImages.length === 0) {
        showError('Não há imagens para remover.');
        return;
    }

    try {
        const lastImage = AppState.platformImages[AppState.platformImages.length - 1];
        await platformImagesRef.child(lastImage.id).remove();
        showSuccess('Imagem de plataforma removida com sucesso!');
        loadPlatformImages();
    } catch (error) {
        console.error('❌ Erro ao remover imagem de plataforma:', error);
        showError('Erro ao remover imagem');
    }
}

async function removePlatformImageFromDashboard() {
    await removePlatformImage();
}

async function deletePlatformImage(imageId) {
    if (!confirm("Tem certeza que deseja excluir esta imagem de plataforma?")) return;

    try {
        await platformImagesRef.child(imageId).remove();
        showSuccess('Imagem de plataforma excluída com sucesso!');
        loadPlatformImages();
    } catch (error) {
        console.error('❌ Erro ao excluir imagem de plataforma:', error);
        showError('Erro ao excluir imagem');
    }
}

function renderDashboardPlatformImages() {
    if (!DOMCache.platformImagesDashboard) return;

    let html = '';

    if (AppState.platformImages.length > 0) {
        AppState.platformImages.forEach((platform, index) => {
            html += `
                <div class="platform-image-item">
                    <img src="${platform.url}" alt="Plataforma ${index + 1}" class="platform-dashboard-img">
                    <p>Plataforma ${index + 1}</p>
                    <div class="dashboard-plan-actions">
                        <button class="btn-action btn-delete" data-action="deletePlatformImage" data-id="${platform.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-center">Nenhuma imagem de plataforma cadastrada.</p>';
    }

    DOMCache.platformImagesDashboard.innerHTML = html;
}

// ============================
// FUNÇÕES DE PRE-CADASTRO
// ============================

function openPreCadastroModal() {
    if (DOMCache.preCadastroModal) {
        DOMCache.preCadastroModal.classList.add('active');
    }
}

function closePreCadastroModal() {
    if (DOMCache.preCadastroModal) {
        DOMCache.preCadastroModal.classList.remove('active');
        if (DOMCache.preCadastroForm) DOMCache.preCadastroForm.reset();
        const preRua = document.getElementById('preRua');
        if (preRua) preRua.value = '';
    }
}

async function buscarCEP() {
    const cepInput = document.getElementById('preCEP');
    if (!cepInput) return;

    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        showError('CEP inválido!');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            showError('CEP não encontrado!');
            return;
        }

        const preRua = document.getElementById('preRua');
        if (preRua) preRua.value = data.logradouro;

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError('Erro ao buscar CEP. Tente novamente.');
    }
}

async function handlePreCadastroSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('preNome') ? document.getElementById('preNome').value.trim() : '';
    const sobrenome = document.getElementById('preSobrenome') ? document.getElementById('preSobrenome').value.trim() : '';
    const dataNascimento = document.getElementById('preDataNascimento') ? document.getElementById('preDataNascimento').value : '';
    const genero = document.getElementById('preGenero') ? document.getElementById('preGenero').value : '';
    const cpf = document.getElementById('preCPF') ? document.getElementById('preCPF').value.trim() : '';
    const rg = document.getElementById('preRG') ? document.getElementById('preRG').value.trim() : '';
    const cep = document.getElementById('preCEP') ? document.getElementById('preCEP').value.trim() : '';
    const rua = document.getElementById('preRua') ? document.getElementById('preRua').value.trim() : '';
    const numero = document.getElementById('preNumero') ? document.getElementById('preNumero').value.trim() : '';
    const complemento = document.getElementById('preComplemento') ? document.getElementById('preComplemento').value.trim() : '';
    const telefone = document.getElementById('preTelefone') ? document.getElementById('preTelefone').value.trim() : '';
    const email = document.getElementById('preEmail') ? document.getElementById('preEmail').value.trim() : '';

    // Validação
    if (!nome || !sobrenome || !dataNascimento || !genero || !cpf || !rg || !cep || !rua || !numero || !telefone || !email) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Validar idade (18+)
    const birth = new Date(dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    if (age < 18) {
        showError('Você deve ter 18 anos ou mais para se cadastrar.');
        return;
    }

    try {
        toggleLoading(DOMCache.submitPreCadastroBtn, DOMCache.submitPreCadastroText, DOMCache.submitPreCadastroLoading, true);

        const preCadastroData = {
            nome: nome,
            sobrenome: sobrenome,
            dataNascimento: dataNascimento,
            genero: genero,
            cpf: cpf,
            rg: rg,
            cep: cep,
            rua: rua,
            numero: numero,
            complemento: complemento || '',
            telefone: telefone,
            email: email,
            createdAt: Date.now(),
            status: 'pendente'
        };

        // Salvar no Firebase
        const newPreCadastroRef = preCadastrosRef.push();
        await newPreCadastroRef.set(preCadastroData);

        closePreCadastroModal();
        showSuccess('Pré-cadastro realizado com sucesso! Entraremos em contato em breve.');

    } catch (error) {
        console.error('❌ Erro ao enviar pré-cadastro:', error);
        showError('Erro ao enviar pré-cadastro. Tente novamente.');
    } finally {
        toggleLoading(DOMCache.submitPreCadastroBtn, DOMCache.submitPreCadastroText, DOMCache.submitPreCadastroLoading, false);
    }
}

// ============================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================

async function loadConfig() {
    try {
        if (!configRef) return;

        // Carregar configurações gerais
        configRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                AppState.config = { ...AppState.config, ...data };
                updateConfigUI();
            }
        });

        // Carregar logo
        if (logoRef) {
            logoRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const logoUrl = snapshot.val();
                    if (logoUrl) {
                        updateLogo(logoUrl);
                    }
                }
            });
        }

        // Carregar imagens das plataformas
        await loadPlatformImages();

        // Carregar galeria de imagens
        await loadGalleryImages();

        // Carregar apps
        await loadApps();

        // Carregar parcerias
        await loadPartners();

    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
    }
}

async function saveConfig() {
    try {
        // Separar configurações por categoria
        const generalConfig = {
            pageTitle: document.getElementById('configPageTitle') ? document.getElementById('configPageTitle').value : AppState.config.pageTitle
        };

        const textConfig = {
            welcomeTitle: document.getElementById('configWelcomeTitle') ? document.getElementById('configWelcomeTitle').value : AppState.config.welcomeTitle,
            welcomeSubtitle: document.getElementById('configWelcomeSubtitle') ? document.getElementById('configWelcomeSubtitle').value : AppState.config.welcomeSubtitle,
            heroTitle: document.getElementById('configHeroTitle') ? document.getElementById('configHeroTitle').value : AppState.config.heroTitle,
            heroDescription: document.getElementById('configHeroDescription') ? document.getElementById('configHeroDescription').value : AppState.config.heroDescription,
            plansSubtitle: document.getElementById('configPlansSubtitle') ? document.getElementById('configPlansSubtitle').value : AppState.config.plansSubtitle,
            employeesSubtitle: document.getElementById('configEmployeesSubtitle') ? document.getElementById('configEmployeesSubtitle').value : AppState.config.employeesSubtitle,
            sidebarText: document.getElementById('configSidebarText') ? document.getElementById('configSidebarText').value : AppState.config.sidebarText
        };

        const whatsappConfig = {
            whatsAppNumber: document.getElementById('configWhatsAppNumber') ? document.getElementById('configWhatsAppNumber').value : AppState.config.whatsAppNumber,
            planMessage: document.getElementById('configPlanMessage') ? document.getElementById('configPlanMessage').value : AppState.config.planMessage,
            contactMessage: document.getElementById('configContactMessage') ? document.getElementById('configContactMessage').value : AppState.config.contactMessage
        };

        const companyConfig = {
            companyName: document.getElementById('configCompanyName') ? document.getElementById('configCompanyName').value : AppState.config.companyName,
            companyDescription: document.getElementById('configCompanyDescription') ? document.getElementById('configCompanyDescription').value : AppState.config.companyDescription,
            companyBiography: document.getElementById('configCompanyBiography') ? document.getElementById('configCompanyBiography').value : AppState.config.companyBiography
        };

        const footerConfig = {
            footerAddress: document.getElementById('configFooterAddress') ? document.getElementById('configFooterAddress').value : AppState.config.footerAddress,
            footerPhone: document.getElementById('configFooterPhone') ? document.getElementById('configFooterPhone').value : AppState.config.footerPhone,
            footerEmail: document.getElementById('configFooterEmail') ? document.getElementById('configFooterEmail').value : AppState.config.footerEmail,
            footerHours: document.getElementById('configFooterHours') ? document.getElementById('configFooterHours').value : AppState.config.footerHours
        };

        // Salvar no Firebase
        await configRef.set({ ...generalConfig, ...textConfig, ...whatsappConfig, ...companyConfig, ...footerConfig });

        // Salvar logo separadamente
        const logoUrl = document.getElementById('configLogoUrl') ? document.getElementById('configLogoUrl').value : '';
        if (logoUrl && logoRef) {
            await logoRef.set(logoUrl);
            updateLogo(logoUrl);
        }

        // Atualizar estado local
        AppState.config = { 
            ...AppState.config, 
            ...generalConfig, 
            ...textConfig, 
            ...whatsappConfig, 
            ...companyConfig,
            ...footerConfig,
            logoUrl: logoUrl || AppState.config.logoUrl
        };

        updateConfigUI();
        closeConfigModal();
        showSuccess('Configurações salvas com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        showError('Erro ao salvar configurações');
    }
}

function updateConfigUI() {
    // Atualizar título da página
    document.title = AppState.config.pageTitle;
    if (DOMCache.pageTitle) DOMCache.pageTitle.textContent = AppState.config.pageTitle;

    // Atualizar logo
    updateLogo(AppState.config.logoUrl);

    // Atualizar textos
    if (DOMCache.welcomeTitle) DOMCache.welcomeTitle.textContent = AppState.config.welcomeTitle;
    if (DOMCache.welcomeSubtitle) DOMCache.welcomeSubtitle.textContent = AppState.config.welcomeSubtitle;

    // Separar título do hero (parte antes e depois da vírgula)
    if (DOMCache.heroTitle) {
        const heroTitleParts = AppState.config.heroTitle.split(', ');
        if (heroTitleParts.length >= 2) {
            DOMCache.heroTitle.innerHTML = `${heroTitleParts[0]}, <span class="highlight">${heroTitleParts[1]}</span>`;
        } else {
            DOMCache.heroTitle.textContent = AppState.config.heroTitle;
        }
    }

    if (DOMCache.heroDescription) DOMCache.heroDescription.textContent = AppState.config.heroDescription;
    if (DOMCache.plansSubtitle) DOMCache.plansSubtitle.textContent = AppState.config.plansSubtitle;
    if (DOMCache.employeesSubtitle) DOMCache.employeesSubtitle.textContent = AppState.config.employeesSubtitle;
    if (DOMCache.sidebarFooterText) DOMCache.sidebarFooterText.textContent = AppState.config.sidebarText;
    if (DOMCache.footerDescription) DOMCache.footerDescription.textContent = AppState.config.companyDescription;
    if (DOMCache.sidebarTitle) DOMCache.sidebarTitle.textContent = AppState.config.companyName.split(' ')[0] || 'TARGET';

    // Atualizar inputs do modal de configuração
    const configPageTitle = document.getElementById('configPageTitle');
    if (configPageTitle) configPageTitle.value = AppState.config.pageTitle;

    const configLogoUrl = document.getElementById('configLogoUrl');
    if (configLogoUrl) configLogoUrl.value = AppState.config.logoUrl;

    const configWelcomeTitle = document.getElementById('configWelcomeTitle');
    if (configWelcomeTitle) configWelcomeTitle.value = AppState.config.welcomeTitle;

    const configWelcomeSubtitle = document.getElementById('configWelcomeSubtitle');
    if (configWelcomeSubtitle) configWelcomeSubtitle.value = AppState.config.welcomeSubtitle;

    const configHeroTitle = document.getElementById('configHeroTitle');
    if (configHeroTitle) configHeroTitle.value = AppState.config.heroTitle;

    const configHeroDescription = document.getElementById('configHeroDescription');
    if (configHeroDescription) configHeroDescription.value = AppState.config.heroDescription;

    const configPlansSubtitle = document.getElementById('configPlansSubtitle');
    if (configPlansSubtitle) configPlansSubtitle.value = AppState.config.plansSubtitle;

    const configEmployeesSubtitle = document.getElementById('configEmployeesSubtitle');
    if (configEmployeesSubtitle) configEmployeesSubtitle.value = AppState.config.employeesSubtitle;

    const configSidebarText = document.getElementById('configSidebarText');
    if (configSidebarText) configSidebarText.value = AppState.config.sidebarText;

    const configWhatsAppNumber = document.getElementById('configWhatsAppNumber');
    if (configWhatsAppNumber) configWhatsAppNumber.value = AppState.config.whatsAppNumber;

    const configPlanMessage = document.getElementById('configPlanMessage');
    if (configPlanMessage) configPlanMessage.value = AppState.config.planMessage;

    const configContactMessage = document.getElementById('configContactMessage');
    if (configContactMessage) configContactMessage.value = AppState.config.contactMessage;

    const configCompanyName = document.getElementById('configCompanyName');
    if (configCompanyName) configCompanyName.value = AppState.config.companyName;

    const configCompanyDescription = document.getElementById('configCompanyDescription');
    if (configCompanyDescription) configCompanyDescription.value = AppState.config.companyDescription;

    const configCompanyBiography = document.getElementById('configCompanyBiography');
    if (configCompanyBiography) configCompanyBiography.value = AppState.config.companyBiography;

    const configFooterAddress = document.getElementById('configFooterAddress');
    if (configFooterAddress) configFooterAddress.value = AppState.config.footerAddress;

    const configFooterPhone = document.getElementById('configFooterPhone');
    if (configFooterPhone) configFooterPhone.value = AppState.config.footerPhone;

    const configFooterEmail = document.getElementById('configFooterEmail');
    if (configFooterEmail) configFooterEmail.value = AppState.config.footerEmail;

    const configFooterHours = document.getElementById('configFooterHours');
    if (configFooterHours) configFooterHours.value = AppState.config.footerHours;
}

function updateLogo(logoUrl) {
    if (logoUrl) {
        if (DOMCache.mainLogo) DOMCache.mainLogo.src = logoUrl;
        if (DOMCache.loginLogoImg) DOMCache.loginLogoImg.src = logoUrl;
        if (DOMCache.dashboardLogoImg) DOMCache.dashboardLogoImg.src = logoUrl;
        if (DOMCache.footerLogoImg) DOMCache.footerLogoImg.src = logoUrl;

        const sidebarLogo = document.querySelector('.sidebar-logo');
        if (sidebarLogo) sidebarLogo.src = logoUrl;

        const introLogo = document.querySelector('.intro-logo');
        if (introLogo) introLogo.src = logoUrl;
    }
}

function switchConfigTab(tabId) {
    // Atualizar tabs
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        }
    });

    // Mostrar conteúdo da tab
    document.querySelectorAll('.config-tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === tabId) {
            content.classList.add('active');
        }
    });
}

// ============================
// FUNÇÕES AUXILIARES PARA COMENTÁRIOS
// ============================

function getEmployeeCommentsCount(employeeId) {
    if (!AppState.ratings) return 0;
    return AppState.ratings.filter(r => r.employeeId === employeeId).length;
}

function getEmployeeComments(employeeId) {
    if (!AppState.ratings) return [];
    return AppState.ratings.filter(r => r.employeeId === employeeId);
}

// ============================
// FILTRO POR CARGO
// ============================

function filterEmployeesByRole(role) {
    AppState.currentFilter = role;

    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === role) {
            btn.classList.add('active');
        }
    });

    // Renderizar funcionários filtrados
    renderEmployees();
}

// ============================
// CARREGAMENTO DE DADOS
// ============================

async function loadInitialData() {
    try {
        // Carregar planos
        await loadPlans();

        // Carregar funcionários
        await loadEmployees();

        // Carregar avaliações
        await loadRatings();

        // Carregar candidatos
        await loadCandidates();

        // Carregar pré-cadastros
        await loadPreCadastros();

        // Carregar apps
        await loadApps();

        // Carregar parcerias
        await loadPartners();

        console.log('✅ Dados iniciais carregados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        loadFallbackData();
    }
}

async function loadDashboardData() {
    try {
        await Promise.all([
            loadPlans(),
            loadEmployees(),
            loadRatings(),
            loadCandidates(),
            loadUsers(),
            loadPreCadastros(),
            loadDashboardComments(),
            loadPlatformImages(),
            loadGalleryImages(),
            loadApps(),
            loadPartners()
        ]);

        console.log('✅ Dados do dashboard carregados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

async function loadPreCadastros() {
    try {
        if (!preCadastrosRef) return;

        preCadastrosRef.on('value', (snapshot) => {
            AppState.preCadastros = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.preCadastros.push({ id: key, ...data[key] });
                });

                // Ordenar por data
                AppState.preCadastros.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }

            if (AppState.isLoggedIn) {
                renderDashboardPreCadastros();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar pré-cadastros:', error);
    }
}

async function loadPlans() {
    try {
        if (!plansRef) return;

        plansRef.on('value', (snapshot) => {
            AppState.plans = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.plans.push({ id: key, ...data[key] });
                });

                // Ordenar por promoção e preço
                AppState.plans.sort((a, b) => {
                    if (a.promotion && !b.promotion) return -1;
                    if (!a.promotion && b.promotion) return 1;
                    return (a.price || 0) - (b.price || 0);
                });
            }

            renderPlans();

            if (AppState.isLoggedIn) {
                renderDashboardPlans();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar planos:', error);
        showError('Erro ao carregar planos');
    }
}

async function loadEmployees() {
    try {
        if (!employeesRef) return;

        employeesRef.on('value', (snapshot) => {
            AppState.employees = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    const employee = { id: key, ...data[key] };
                    // Garantir que a foto tenha um valor padrão se estiver vazia
                    if (!employee.photo || employee.photo.trim() === '') {
                        employee.photo = 'https://i.imgur.com/7R0l7cO.png';
                    }
                    AppState.employees.push(employee);
                });

                // Ordenar por verificação e rating
                AppState.employees.sort((a, b) => {
                    if (a.verified && !b.verified) return -1;
                    if (!a.verified && b.verified) return 1;
                    return (b.rating || 0) - (a.rating || 0);
                });
            }

            renderEmployees();
            renderRoleFilters();
            renderCommentsSection();

            if (AppState.isLoggedIn) {
                renderDashboardEmployees();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar funcionários:', error);
        showError('Erro ao carregar funcionários');
    }
}

async function loadRatings() {
    try {
        if (!ratingsRef) return;

        ratingsRef.on('value', (snapshot) => {
            AppState.ratings = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.ratings.push({ id: key, ...data[key] });
                });

                updateEmployeesWithRatings();
                // CORREÇÃO: Chamar renderCommentsSection para exibir avaliações desde o início
                renderCommentsSection();
            }

            if (AppState.isLoggedIn) {
                loadDashboardComments();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar avaliações:', error);
    }
}

async function loadCandidates() {
    try {
        if (!candidatesRef) return;

        candidatesRef.on('value', (snapshot) => {
            AppState.candidates = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.candidates.push({ id: key, ...data[key] });
                });

                // Ordenar por data
                AppState.candidates.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }

            if (AppState.isLoggedIn) {
                renderDashboardCandidates();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar candidatos:', error);
    }
}

async function loadUsers() {
    try {
        if (!usersRef) return;

        usersRef.on('value', (snapshot) => {
            AppState.users = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.users.push({ id: key, ...data[key] });
                });

                // Ordenar por data
                AppState.users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
    }
}

async function loadDashboardComments() {
    try {
        if (!AppState.isLoggedIn) return;

        let html = '';

        if (AppState.ratings.length > 0) {
            const sortedRatings = [...AppState.ratings].sort((a, b) => 
                (b.createdAt || 0) - (a.createdAt || 0)
            );

            sortedRatings.forEach(rating => {
                const employee = AppState.employees.find(e => e.id === rating.employeeId);
                html += `
                    <div class="dashboard-plan-item">
                        <div class="dashboard-plan-header">
                            <div>
                                <h4 class="dashboard-plan-name">${rating.studentName || 'Anônimo'}</h4>
                                <p class="dashboard-plan-price">Avaliou: ${employee ? employee.name : 'Funcionário'}</p>
                                <div class="dashboard-plan-features">
                                    <span class="dashboard-plan-feature">${'★'.repeat(rating.rating || 0)}${'☆'.repeat(5-(rating.rating || 0))}</span>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard-plan-details">
                            <p>${rating.comment || 'Sem comentário'}</p>
                            <div style="font-size: 0.8rem; color: #999; margin-top: 10px;">
                                ${new Date(rating.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div class="dashboard-plan-actions">
                            <button class="btn-action btn-delete" data-action="deleteComment" data-id="${rating.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                `;
            });
        } else {
            html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma avaliação encontrada.</p>';
        }

        if (DOMCache.dashboardCommentsList) {
            DOMCache.dashboardCommentsList.innerHTML = html;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar avaliações:', error);
    }
}

// ============================
// RENDERIZAÇÃO
// ============================

function renderPlans() {
    if (!DOMCache.plansContainer) return;

    let html = '';

    AppState.plans.forEach(plan => {
        const features = plan.features || [];
        const isPromotion = plan.promotion || false;

        html += `
            <div class="plan-card ${isPromotion ? 'promotion' : ''} ${plan.featured ? 'featured' : ''}">
                ${plan.featured ? '<div class="plan-featured-badge">DESTAQUE</div>' : ''}
                <div class="plan-header">
                    <h3>${plan.name || 'Plano'}</h3>
                    <div class="plan-price-container">
                        <div class="plan-price">
                            <span class="plan-currency">R$</span>${(plan.price || 0).toFixed(2)}
                        </div>
                        <div class="plan-period">/${plan.period || 'mensal'}</div>
                    </div>
                </div>
                <div class="plan-body">
                    <p class="plan-description">${plan.description || 'Plano completo para sua jornada fitness'}</p>
                    <ul class="plan-features-list">
                        ${features.map(feature => `
                            <li class="plan-feature-item">
                                <i class="fas fa-check"></i>
                                <span>${feature}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="plan-actions">
                    <button class="btn-plan" data-id="${plan.id}" data-name="${plan.name || 'Plano'}">
                        Contratar Plano
                    </button>
                </div>
            </div>
        `;
    });

    DOMCache.plansContainer.innerHTML = html || '<p class="text-center">Nenhum plano disponível no momento.</p>';
}

function renderEmployees() {
    if (!DOMCache.employeesList) return;

    let html = '';

    // Filtrar por cargo selecionado
    const filteredEmployees = AppState.currentFilter === 'all' 
        ? AppState.employees 
        : AppState.employees.filter(emp => emp.role === AppState.currentFilter);

    if (filteredEmployees.length === 0) {
        if (filteredEmployees.length > 0 && AppState.currentFilter !== 'all') {
            html = `<p class="text-center">Nenhum funcionário encontrado para o cargo "${AppState.currentFilter}".</p>`;
        } else {
            html = '<p class="text-center">Nenhum funcionário encontrado.</p>';
        }
    } else {
        filteredEmployees.forEach(employee => {
            const expertise = employee.expertise || ['Personal Training', 'Nutrição Esportiva'];
            const rating = employee.rating || 0;
            const commentsCount = getEmployeeCommentsCount(employee.id);

            // Garantir que a URL da foto seja válida
            const photoUrl = employee.photo || 'https://i.imgur.com/7R0l7cO.png';

            html += `
                <div class="employee-list-item">
                    <div class="employee-list-header">
                        <img src="${photoUrl}" alt="${employee.name}" class="employee-avatar" onerror="this.src='https://i.imgur.com/7R0l7cO.png'">
                        <div class="employee-info-container">
                            <div class="employee-name-role">
                                <h3 class="employee-name">${employee.name || 'Funcionário'}</h3>
                                <p class="employee-role">${employee.role || 'Personal Trainer'}</p>
                            </div>
                            <div class="employee-rating-badge">
                                <i class="fas fa-star"></i>
                                ${rating.toFixed(1)}/5.0 (${commentsCount} avaliações)
                            </div>
                        </div>
                    </div>
                    <div class="employee-list-body">
                        <p class="employee-description">
                            ${employee.description || 'Profissional dedicado com anos de experiência em treinamento físico e nutrição esportiva.'}
                        </p>
                        <div class="employee-expertise">
                            ${expertise.map(item => `
                                <span class="expertise-tag">${item}</span>
                            `).join('')}
                        </div>
                        <div class="employee-actions">
                            <button class="btn-view-comments" data-id="${employee.id}">
                                <i class="fas fa-comments"></i>
                                Ver Comentários
                            </button>
                            <button class="btn-rate-employee" data-id="${employee.id}">
                                <i class="fas fa-star"></i>
                                Avaliar Funcionário
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    DOMCache.employeesList.innerHTML = html;
}

function renderRoleFilters() {
    if (!DOMCache.roleFilterContainer) return;

    // Coletar cargos únicos (incluindo o filtro "Todos")
    const roles = ['all'];
    AppState.employees.forEach(employee => {
        if (employee.role && !roles.includes(employee.role)) {
            roles.push(employee.role);
        }
    });

    let html = '';
    roles.forEach(role => {
        const label = role === 'all' ? 'Todos' : role;
        const isActive = role === AppState.currentFilter;
        html += `
            <button class="filter-btn ${isActive ? 'active' : ''}" data-role="${role}">
                ${label}
            </button>
        `;
    });

    DOMCache.roleFilterContainer.innerHTML = html;

    // Adicionar eventos de clique aos botões de filtro
    DOMCache.roleFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            filterEmployeesByRole(role);
        });
    });
}

function renderCommentsSection() {
    if (!DOMCache.commentsContainer) return;

    let html = '';

    // Pegar as últimas 6 avaliações
    const recentRatings = [...AppState.ratings]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 6);

    if (recentRatings.length === 0) {
        // CORREÇÃO: Remover mensagem que só aparecia depois de adicionar funcionário
        // e mostrar mensagem mais clara
        html = '<p class="text-center">Seja o primeiro a avaliar nossos profissionais!</p>';
    } else {
        recentRatings.forEach(rating => {
            const employee = AppState.employees.find(e => e.id === rating.employeeId);
            html += `
                <div class="swiper-slide">
                    <div class="comment-card">
                        <div class="comment-header">
                            <img src="${employee ? (employee.photo || 'https://i.imgur.com/7R0l7cO.png') : 'https://i.imgur.com/7R0l7cO.png'}" 
                                 alt="${employee ? employee.name : 'Funcionário'}" 
                                 class="comment-avatar">
                            <div class="comment-info">
                                <h4>${rating.studentName || 'Anônimo'}</h4>
                                <p>${employee ? employee.role : 'Profissional'}</p>
                            </div>
                        </div>
                        <div class="comment-rating">
                            ${'★'.repeat(rating.rating || 0)}${'☆'.repeat(5-(rating.rating || 0))}
                        </div>
                        <p class="comment-text">"${rating.comment || 'Sem comentário'}"</p>
                    </div>
                </div>
            `;
        });
    }

    DOMCache.commentsContainer.innerHTML = html;

    // Atualizar swiper
    if (AppState.commentsSwiper) {
        AppState.commentsSwiper.update();
    }
}

function renderDashboardPlans() {
    if (!DOMCache.dashboardPlansList) return;

    let html = '';

    AppState.plans.forEach(plan => {
        const features = plan.features || [];
        const isPromotion = plan.promotion || false;

        html += `
            <div class="dashboard-plan-item">
                <div class="dashboard-plan-header">
                    <h4 class="dashboard-plan-name">${plan.name || 'Plano'}</h4>
                    <div class="dashboard-plan-price">R$ ${(plan.price || 0).toFixed(2)}</div>
                </div>
                <div class="dashboard-plan-details">
                    <p>${plan.description || 'Plano completo para sua jornada fitness'}</p>
                    <div class="dashboard-plan-features">
                        ${features.slice(0, 3).map(feature => `
                            <span class="dashboard-plan-feature">${feature}</span>
                        `).join('')}
                        ${features.length > 3 ? `<span class="dashboard-plan-feature">+${features.length - 3} mais</span>` : ''}
                    </div>
                    <p><strong>Período:</strong> ${plan.period || 'mensal'}</p>
                    <p><strong>Promoção:</strong> ${isPromotion ? 'Sim' : 'Não'}</p>
                </div>
                <div class="dashboard-plan-actions">
                    <button class="btn-action btn-edit" data-action="editPlan" data-id="${plan.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" data-action="deletePlan" data-id="${plan.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                    <button class="btn-action btn-promotion" data-action="togglePromotion" data-id="${plan.id}">
                        <i class="fas ${isPromotion ? 'fa-times' : 'fa-percentage'}"></i> ${isPromotion ? 'Remover Promoção' : 'Marcar como Promoção'}
                    </button>
                </div>
            </div>
        `;
    });

    DOMCache.dashboardPlansList.innerHTML = html || '<p class="text-center">Nenhum plano cadastrado.</p>';
}

function renderDashboardEmployees() {
    if (!DOMCache.dashboardEmployeesList) return;

    let html = '';

    AppState.employees.forEach(employee => {
        const rating = employee.rating || 0;
        const commentsCount = getEmployeeCommentsCount(employee.id);

        // Garantir que a foto seja válida
        const photoUrl = employee.photo || 'https://i.imgur.com/7R0l7cO.png';

        html += `
            <div class="dashboard-plan-item">
                <div class="dashboard-plan-header">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${photoUrl}" alt="${employee.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://i.imgur.com/7R0l7cO.png'">
                        <div>
                            <h4 class="dashboard-plan-name">${employee.name || 'Funcionário'}</h4>
                            <p class="dashboard-plan-price">${employee.role || 'Personal Trainer'}</p>
                            <div class="dashboard-plan-features">
                                <span class="dashboard-plan-feature">${'★'.repeat(Math.round(rating))}${'☆'.repeat(5-Math.round(rating))} ${rating.toFixed(1)}</span>
                                <span class="dashboard-plan-feature">${commentsCount} comentários</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-plan-details">
                    <p>${employee.description || 'Profissional dedicado com anos de experiência.'}</p>
                    <p><strong>Especialidades:</strong> ${(employee.expertise || []).join(', ')}</p>
                </div>
                <div class="dashboard-plan-actions">
                    <button class="btn-action btn-edit" data-action="editEmployee" data-id="${employee.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" data-action="deleteEmployee" data-id="${employee.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                    <button class="btn-action btn-promotion" data-action="toggleVerified" data-id="${employee.id}">
                        <i class="fas fa-check-circle"></i> ${employee.verified ? 'Remover Verificação' : 'Verificar'}
                    </button>
                </div>
            </div>
        `;
    });

    DOMCache.dashboardEmployeesList.innerHTML = html || '<p class="text-center">Nenhum funcionário cadastrado.</p>';
}

function renderDashboardPreCadastros() {
    if (!DOMCache.preCadastrosList) return;

    let html = '';

    if (AppState.preCadastros.length > 0) {
        AppState.preCadastros.forEach(preCadastro => {
            html += `
                <div class="pre-cadastro-item">
                    <div class="pre-cadastro-header">
                        <div class="pre-cadastro-info">
                            <h4>${preCadastro.nome} ${preCadastro.sobrenome}</h4>
                            <p class="pre-cadastro-cpf">CPF: ${preCadastro.cpf}</p>
                            <p class="pre-cadastro-email">${preCadastro.email}</p>
                            <p><small>Telefone: ${preCadastro.telefone}</small></p>
                        </div>
                        <div class="pre-cadastro-actions">
                            <button class="btn-action btn-delete" data-action="deletePreCadastro" data-id="${preCadastro.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                    <div class="dashboard-plan-details">
                        <p><strong>Endereço:</strong> ${preCadastro.rua}, ${preCadastro.numero} ${preCadastro.complemento ? '- ' + preCadastro.complemento : ''}</p>
                        <p><strong>Data Nasc.:</strong> ${preCadastro.dataNascimento} | <strong>Gênero:</strong> ${preCadastro.genero}</p>
                        <p><strong>RG:</strong> ${preCadastro.rg} | <strong>CEP:</strong> ${preCadastro.cep}</p>
                        <p><small>Data do cadastro: ${new Date(preCadastro.createdAt || Date.now()).toLocaleDateString('pt-BR')}</small></p>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum pré-cadastro encontrado.</p>';
    }

    DOMCache.preCadastrosList.innerHTML = html;
}

function renderDashboardCandidates() {
    if (!DOMCache.candidatesList) return;

    let html = '';

    if (AppState.candidates.length > 0) {
        AppState.candidates.forEach(candidate => {
            html += `
                <div class="candidate-item" data-id="${candidate.id}">
                    <div class="candidate-header">
                        <div class="candidate-info">
                            <h4>${candidate.firstName} ${candidate.lastName}</h4>
                            <p class="candidate-role">${candidate.role}</p>
                            <p><small>${candidate.email} • ${candidate.phone}</small></p>
                        </div>
                        <div class="candidate-actions">
                            <button class="btn-whatsapp" data-phone="${candidate.phone}">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                            <button class="btn-action btn-delete" data-action="deleteCandidate" data-id="${candidate.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                    <div class="dashboard-plan-details">
                        <p><strong>Endereço:</strong> ${candidate.address}, ${candidate.addressNumber} ${candidate.complement ? '- ' + candidate.complement : ''}</p>
                        <p><small>Data de candidatura: ${new Date(candidate.createdAt || Date.now()).toLocaleDateString('pt-BR')}</small></p>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum candidato encontrado.</p>';
    }

    DOMCache.candidatesList.innerHTML = html;

    // Adicionar event listeners para abrir modal de candidato
    document.querySelectorAll('.candidate-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-whatsapp') && !e.target.closest('.btn-action')) {
                const candidateId = item.dataset.id;
                openCandidateModal(candidateId);
            }
        });
    });
}

// ============================
// FILTROS
// ============================

function filterComments() {
    const filterText = DOMCache.filterComments ? DOMCache.filterComments.value.toLowerCase() : '';

    if (!filterText) {
        loadDashboardComments();
        return;
    }

    let html = '';
    const filteredRatings = AppState.ratings.filter(rating => {
        const employee = AppState.employees.find(e => e.id === rating.employeeId);
        const employeeName = employee ? employee.name.toLowerCase() : '';
        const studentName = (rating.studentName || '').toLowerCase();

        return studentName.includes(filterText) || employeeName.includes(filterText);
    });

    if (filteredRatings.length > 0) {
        filteredRatings.forEach(rating => {
            const employee = AppState.employees.find(e => e.id === rating.employeeId);
            html += `
                <div class="dashboard-plan-item">
                    <div class="dashboard-plan-header">
                        <div>
                            <h4 class="dashboard-plan-name">${rating.studentName || 'Anônimo'}</h4>
                            <p class="dashboard-plan-price">Avaliou: ${employee ? employee.name : 'Funcionário'}</p>
                            <div class="dashboard-plan-features">
                                <span class="dashboard-plan-feature">${'★'.repeat(rating.rating || 0)}${'☆'.repeat(5-(rating.rating || 0))}</span>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-plan-details">
                        <p>${rating.comment || 'Sem comentário'}</p>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 10px;">
                            ${new Date(rating.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                    <div class="dashboard-plan-actions">
                        <button class="btn-action btn-delete" data-action="deleteComment" data-id="${rating.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma avaliação encontrada com este filtro.</p>';
    }

    if (DOMCache.dashboardCommentsList) {
        DOMCache.dashboardCommentsList.innerHTML = html;
    }
}

// ============================
// WHATSAPP
// ============================

function openWhatsApp(type, planName = '') {
    const whatsappNumber = AppState.config.whatsAppNumber || '5511959749844';
    let message = '';

    if (type === 'plan' && planName) {
        message = AppState.config.planMessage.replace('[PLANO]', planName);
    } else {
        message = AppState.config.contactMessage;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
}

function openCandidateWhatsApp(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanPhone}`;
    window.open(url, '_blank');
}

// ============================
// AUTENTICAÇÃO
// ============================

async function checkAuthState() {
    try {
        if (!firebaseAuth) return;

        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                // Usuário está logado
                AppState.currentUser = user;
                AppState.isLoggedIn = true;

                // Verificar se é o email permitido
                const allowedEmails = ['target@gmail.com', 'adielfhellip@gmail.com'];
                if (allowedEmails.includes(user.email)) {
                    // Atualizar UI
                    if (DOMCache.userAvatar) DOMCache.userAvatar.textContent = user.email.charAt(0).toUpperCase();
                    if (DOMCache.userEmail) DOMCache.userEmail.textContent = user.email;

                    // Mostrar botão do dashboard no menu lateral
                    if (DOMCache.dashboardBtn) {
                        DOMCache.dashboardBtn.style.display = 'block';
                    }

                    // Carregar dados do dashboard
                    await loadDashboardData();
                    showDashboard();
                } else {
                    // Usuário não autorizado
                    await firebaseAuth.signOut();
                    showError('Acesso não autorizado. Use target@gmail.com para acessar o dashboard.');
                    showMainPage();
                }
            } else {
                // Usuário não está logado
                AppState.isLoggedIn = false;

                // Ocultar botão do dashboard no menu lateral
                if (DOMCache.dashboardBtn) {
                    DOMCache.dashboardBtn.style.display = 'none';
                }

                showMainPage();
            }
        });
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showMainPage();
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
    const password = document.getElementById('password') ? document.getElementById('password').value : '';

    // Validação básica
    if (!email || !password) {
        showLoginError('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Mostrar loading
        toggleLoading(DOMCache.loginBtn, DOMCache.loginText, DOMCache.loginLoading, true);

        // Tentar login com Firebase
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login bem-sucedido:', userCredential.user.email);

    } catch (error) {
        console.error('❌ Erro no login:', error);

        // Mensagens de erro amigáveis
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'E-mail inválido.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                break;
        }

        showLoginError(errorMessage);
    } finally {
        // Esconder loading
        toggleLoading(DOMCache.loginBtn, DOMCache.loginText, DOMCache.loginLoading, false);
    }
}

async function handleLogout() {
    try {
        await firebaseAuth.signOut();
        console.log('✅ Logout realizado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        showError('Erro ao sair da conta');
    }
}

// ============================
// FUNÇÕES DE UI
// ============================

function openSidebar() {
    if (DOMCache.sidebar) DOMCache.sidebar.classList.add('active');
    if (DOMCache.overlay) DOMCache.overlay.classList.add('active');
}

function closeSidebar() {
    if (DOMCache.sidebar) DOMCache.sidebar.classList.remove('active');
    if (DOMCache.overlay) DOMCache.overlay.classList.remove('active');
}

function openConfigModal() {
    if (DOMCache.configModal) DOMCache.configModal.classList.add('active');
}

function closeConfigModal() {
    if (DOMCache.configModal) DOMCache.configModal.classList.remove('active');
}

function openWorkModal() {
    if (DOMCache.workModal) DOMCache.workModal.classList.add('active');
}

function closeWorkModal() {
    if (DOMCache.workModal) DOMCache.workModal.classList.remove('active');
}

function openWorkFormModal(role) {
    if (DOMCache.selectedRole) DOMCache.selectedRole.value = role;
    closeWorkModal();
    if (DOMCache.workFormModal) DOMCache.workFormModal.classList.add('active');
}

function closeWorkFormModal() {
    if (DOMCache.workFormModal) DOMCache.workFormModal.classList.remove('active');
    if (DOMCache.workForm) DOMCache.workForm.reset();
}

function openRatingModal(employeeId) {
    const employee = AppState.employees.find(e => e.id === employeeId);
    if (!employee) return;

    AppState.currentEmployeeId = employeeId;

    // Atualizar informações do funcionário no modal
    const employeeInfoHtml = `
        <img src="${employee.photo || 'https://i.imgur.com/7R0l7cO.png'}" alt="${employee.name}" class="rating-modal-employee-avatar" onerror="this.src='https://i.imgur.com/7R0l7cO.png'">
        <div class="rating-modal-employee-details">
            <h4>${employee.name}</h4>
            <p>${employee.role || 'Personal Trainer'}</p>
        </div>
    `;

    if (DOMCache.ratingEmployeeInfo) {
        DOMCache.ratingEmployeeInfo.innerHTML = employeeInfoHtml;
    }

    // Limpar formulário
    const studentName = document.getElementById('studentName');
    const comment = document.getElementById('comment');
    if (studentName) studentName.value = '';
    if (comment) comment.value = '';
    setRating(0);

    // Definir o ID do funcionário no campo hidden
    const employeeIdInput = document.getElementById('employeeId');
    if (employeeIdInput) employeeIdInput.value = employeeId;

    // Abrir modal
    if (DOMCache.ratingModal) DOMCache.ratingModal.classList.add('active');
}

function closeRatingModal() {
    if (DOMCache.ratingModal) DOMCache.ratingModal.classList.remove('active');
    AppState.currentEmployeeId = null;
}

function setRating(value) {
    document.querySelectorAll('.rating-star-large').forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        star.classList.toggle('active', starValue <= value);
    });
}

async function handleRatingSubmit(e) {
    e.preventDefault();

    const studentName = document.getElementById('studentName') ? document.getElementById('studentName').value.trim() : '';
    const comment = document.getElementById('comment') ? document.getElementById('comment').value.trim() : '';
    const ratingStars = document.querySelectorAll('.rating-star-large.active').length;
    const employeeId = document.getElementById('employeeId') ? document.getElementById('employeeId').value : '';

    // Validação
    if (!studentName || !comment || ratingStars === 0 || !employeeId) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        toggleLoading(DOMCache.submitRatingBtn, DOMCache.submitRatingText, DOMCache.submitRatingLoading, true);

        const ratingData = {
            employeeId: employeeId,
            studentName: studentName,
            rating: ratingStars,
            comment: comment,
            createdAt: Date.now()
        };

        // Salvar no Firebase
        const newRatingRef = ratingsRef.push();
        await newRatingRef.set(ratingData);

        // Atualizar avaliação do funcionário
        await updateEmployeeRating(employeeId);

        closeRatingModal();
        showSuccess('Avaliação enviada com sucesso! Obrigado pelo feedback.');

    } catch (error) {
        console.error('❌ Erro ao enviar avaliação:', error);
        showError('Erro ao enviar avaliação. Tente novamente.');
    } finally {
        toggleLoading(DOMCache.submitRatingBtn, DOMCache.submitRatingText, DOMCache.submitRatingLoading, false);
    }
}

async function handleWorkFormSubmit(e) {
    e.preventDefault();

    const role = DOMCache.selectedRole ? DOMCache.selectedRole.value : '';
    const firstName = document.getElementById('firstName') ? document.getElementById('firstName').value.trim() : '';
    const lastName = document.getElementById('lastName') ? document.getElementById('lastName').value.trim() : '';
    const birthDate = document.getElementById('birthDate') ? document.getElementById('birthDate').value : '';
    const email = document.getElementById('candidateEmail') ? document.getElementById('candidateEmail').value.trim() : '';
    const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
    const address = document.getElementById('address') ? document.getElementById('address').value.trim() : '';
    const addressNumber = document.getElementById('addressNumber') ? document.getElementById('addressNumber').value.trim() : '';
    const complement = document.getElementById('complement') ? document.getElementById('complement').value.trim() : '';
    const aboutYou = document.getElementById('aboutYou') ? document.getElementById('aboutYou').value.trim() : '';
    const experience = document.getElementById('experience') ? document.getElementById('experience').value.trim() : '';
    const curriculoFile = document.getElementById('curriculo') ? document.getElementById('curriculo').files[0] : null;

    // Validação
    if (!firstName || !lastName || !birthDate || !email || !phone || !address || !addressNumber || !aboutYou || !experience) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Validar idade (18+)
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    if (age < 18) {
        showError('Você deve ter 18 anos ou mais para se candidatar.');
        return;
    }

    try {
        toggleLoading(DOMCache.submitWorkFormBtn, DOMCache.submitWorkFormText, DOMCache.submitWorkFormLoading, true);

        let curriculoUrl = '';
        if (curriculoFile) {
            curriculoUrl = await uploadImageToImgBB(curriculoFile);
        }

        const candidateData = {
            role: role,
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            email: email,
            phone: phone,
            address: address,
            addressNumber: addressNumber,
            complement: complement,
            aboutYou: aboutYou,
            experience: experience,
            curriculoUrl: curriculoUrl,
            createdAt: Date.now()
        };

        // Salvar no Firebase
        const newCandidateRef = candidatesRef.push();
        await newCandidateRef.set(candidateData);

        closeWorkFormModal();
        showSuccess('Candidatura enviada com sucesso! Entraremos em contato em breve.');

    } catch (error) {
        console.error('❌ Erro ao enviar candidatura:', error);
        showError('Erro ao enviar candidatura. Tente novamente.');
    } finally {
        toggleLoading(DOMCache.submitWorkFormBtn, DOMCache.submitWorkFormText, DOMCache.submitWorkFormLoading, false);
    }
}

async function handleConfigSubmit(e) {
    e.preventDefault();

    try {
        toggleLoading(DOMCache.saveConfigBtn, DOMCache.saveConfigText, DOMCache.saveConfigLoading, true);
        await saveConfig();
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        showError('Erro ao salvar configurações.');
    } finally {
        toggleLoading(DOMCache.saveConfigBtn, DOMCache.saveConfigText, DOMCache.saveConfigLoading, false);
    }
}

function openCommentsModal(employeeId) {
    const employee = AppState.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const commentsCount = getEmployeeCommentsCount(employeeId);

    // Atualizar informações do funcionário no modal
    const employeeInfoHtml = `
        <img src="${employee.photo || 'https://i.imgur.com/7R0l7cO.png'}" alt="${employee.name}" class="rating-modal-employee-avatar" onerror="this.src='https://i.imgur.com/7R0l7cO.png'">
        <div class="rating-modal-employee-details">
            <h4>${employee.name}</h4>
            <p>${employee.role || 'Personal Trainer'}</p>
        </div>
    `;

    if (DOMCache.commentsEmployeeInfo) {
        DOMCache.commentsEmployeeInfo.innerHTML = employeeInfoHtml;
    }

    if (DOMCache.commentsModalTitle) {
        DOMCache.commentsModalTitle.textContent = `Comentários - ${employee.name}`;
    }

    if (DOMCache.commentsModalSubtitle) {
        DOMCache.commentsModalSubtitle.textContent = 'Avaliações dos alunos sobre este profissional';
    }

    // Carregar comentários
    let commentsHtml = '';
    if (commentsCount > 0) {
        const employeeRatings = AppState.ratings.filter(r => r.employeeId === employeeId);
        const sortedRatings = [...employeeRatings].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        sortedRatings.forEach(rating => {
            commentsHtml += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${rating.studentName || 'Anônimo'}</span>
                        <span class="comment-date">${new Date(rating.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="comment-rating">
                        ${'★'.repeat(rating.rating || 0)}${'☆'.repeat(5-(rating.rating || 0))}
                    </div>
                    <p class="comment-text">${rating.comment || 'Sem comentário'}</p>
                </div>
            `;
        });
    } else {
        commentsHtml = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum comentário encontrado para este funcionário.</p>';
    }

    if (DOMCache.commentsList) {
        DOMCache.commentsList.innerHTML = commentsHtml;
    }

    if (DOMCache.commentsModal) {
        DOMCache.commentsModal.classList.add('active');
    }
}

function closeCommentsModal() {
    if (DOMCache.commentsModal) DOMCache.commentsModal.classList.remove('active');
}

function showMainPage() {
    if (DOMCache.loginContainer) DOMCache.loginContainer.style.display = 'none';
    if (DOMCache.dashboard) DOMCache.dashboard.style.display = 'none';

    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');

    if (main) main.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (header) header.style.display = 'block';
    if (DOMCache.supportBtn) DOMCache.supportBtn.style.display = 'flex';
}

function showDashboard() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }

    if (DOMCache.loginContainer) DOMCache.loginContainer.style.display = 'none';
    if (DOMCache.dashboard) DOMCache.dashboard.style.display = 'block';

    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');

    if (main) main.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (header) header.style.display = 'none';
    if (DOMCache.supportBtn) DOMCache.supportBtn.style.display = 'none';

    switchTab('plans');
}

function showLogin() {
    if (DOMCache.loginContainer) DOMCache.loginContainer.style.display = 'flex';
    if (DOMCache.dashboard) DOMCache.dashboard.style.display = 'none';

    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');

    if (main) main.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (header) header.style.display = 'none';
    if (DOMCache.supportBtn) DOMCache.supportBtn.style.display = 'none';

    if (DOMCache.loginForm) DOMCache.loginForm.reset();
    if (DOMCache.loginError) DOMCache.loginError.style.display = 'none';
}

function switchTab(tabId) {
    // Remover classe active de todas as abas do menu
    if (DOMCache.dashboardMenuItems) {
        DOMCache.dashboardMenuItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    // Remover classe active de todos os conteúdos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Adicionar classe active à aba selecionada
    const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabElement) tabElement.classList.add('active');

    // Mostrar conteúdo da aba selecionada
    const tabContent = document.getElementById(`${tabId}Tab`);
    if (tabContent) tabContent.classList.add('active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================
// MODAIS DE PLANO E FUNCIONÁRIO
// ============================

function openPlanModal(planId = null) {
    if (planId) {
        // Editar plano existente
        const plan = AppState.plans.find(p => p.id === planId);
        if (!plan) return;

        const planIdInput = document.getElementById('planId');
        const planName = document.getElementById('planName');
        const planPrice = document.getElementById('planPrice');
        const planPeriod = document.getElementById('planPeriod');
        const planDescription = document.getElementById('planDescription');
        const planFeatures = document.getElementById('planFeatures');
        const planPromotion = document.getElementById('planPromotion');
        const planFeatured = document.getElementById('planFeatured');

        if (planIdInput) planIdInput.value = planId;
        if (planName) planName.value = plan.name || '';
        if (planPrice) planPrice.value = plan.price || '';
        if (planPeriod) planPeriod.value = plan.period || 'mensal';
        if (planDescription) planDescription.value = plan.description || '';
        if (planFeatures) planFeatures.value = (plan.features || []).join(', ');
        if (planPromotion) planPromotion.checked = plan.promotion || false;
        if (planFeatured) planFeatured.checked = plan.featured || false;

        if (DOMCache.planModalTitle) DOMCache.planModalTitle.textContent = 'Editar Plano';
        if (DOMCache.planModalSubtitle) DOMCache.planModalSubtitle.textContent = 'Edite os dados do plano';
    } else {
        // Criar novo plano
        const planIdInput = document.getElementById('planId');
        const planName = document.getElementById('planName');
        const planPrice = document.getElementById('planPrice');
        const planPeriod = document.getElementById('planPeriod');
        const planDescription = document.getElementById('planDescription');
        const planFeatures = document.getElementById('planFeatures');
        const planPromotion = document.getElementById('planPromotion');
        const planFeatured = document.getElementById('planFeatured');

        if (planIdInput) planIdInput.value = '';
        if (planName) planName.value = '';
        if (planPrice) planPrice.value = '';
        if (planPeriod) planPeriod.value = 'mensal';
        if (planDescription) planDescription.value = '';
        if (planFeatures) planFeatures.value = '';
        if (planPromotion) planPromotion.checked = false;
        if (planFeatured) planFeatured.checked = false;

        if (DOMCache.planModalTitle) DOMCache.planModalTitle.textContent = 'Criar Novo Plano';
        if (DOMCache.planModalSubtitle) DOMCache.planModalSubtitle.textContent = 'Preencha os dados do plano';
    }

    if (DOMCache.planModal) DOMCache.planModal.classList.add('active');
}

function closePlanModal() {
    if (DOMCache.planModal) DOMCache.planModal.classList.remove('active');
    if (DOMCache.planForm) DOMCache.planForm.reset();
}

async function handlePlanSubmit(e) {
    e.preventDefault();

    const planId = document.getElementById('planId') ? document.getElementById('planId').value : '';
    const planName = document.getElementById('planName') ? document.getElementById('planName').value.trim() : '';
    const planPrice = document.getElementById('planPrice') ? parseFloat(document.getElementById('planPrice').value) : 0;
    const planPeriod = document.getElementById('planPeriod') ? document.getElementById('planPeriod').value : '';
    const planDescription = document.getElementById('planDescription') ? document.getElementById('planDescription').value.trim() : '';
    const planFeaturesInput = document.getElementById('planFeatures') ? document.getElementById('planFeatures').value.trim() : '';
    const planPromotion = document.getElementById('planPromotion') ? document.getElementById('planPromotion').checked : false;
    const planFeatured = document.getElementById('planFeatured') ? document.getElementById('planFeatured').checked : false;

    // Validação
    if (!planName || isNaN(planPrice) || !planPeriod || !planDescription || !planFeaturesInput) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        toggleLoading(DOMCache.savePlanBtn, DOMCache.savePlanText, DOMCache.savePlanLoading, true);

        const planData = {
            name: planName,
            price: planPrice,
            period: planPeriod,
            description: planDescription,
            features: planFeaturesInput.split(',').map(f => f.trim()).filter(f => f),
            promotion: planPromotion,
            featured: planFeatured,
            updatedAt: Date.now()
        };

        if (planId) {
            // Atualizar plano existente
            await plansRef.child(planId).update(planData);
            showSuccess('Plano atualizado com sucesso!');
        } else {
            // Criar novo plano
            planData.createdAt = Date.now();
            const newPlanRef = plansRef.push();
            await newPlanRef.set(planData);
            showSuccess('Plano criado com sucesso!');
        }

        closePlanModal();
        loadPlans();

    } catch (error) {
        console.error('❌ Erro ao salvar plano:', error);
        showError('Erro ao salvar plano. Tente novamente.');
    } finally {
        toggleLoading(DOMCache.savePlanBtn, DOMCache.savePlanText, DOMCache.savePlanLoading, false);
    }
}

function openEmployeeModal(employeeId = null) {
    if (employeeId) {
        // Editar funcionário existente
        const employee = AppState.employees.find(e => e.id === employeeId);
        if (!employee) return;

        const employeeFormId = document.getElementById('employeeFormId');
        const employeeName = document.getElementById('employeeName');
        const employeeRole = document.getElementById('employeeRole');
        const employeeDescription = document.getElementById('employeeDescription');
        const employeeExpertise = document.getElementById('employeeExpertise');
        const employeePhotoUrl = document.getElementById('employeePhotoUrl');
        const employeeVerified = document.getElementById('employeeVerified');

        if (employeeFormId) employeeFormId.value = employeeId;
        if (employeeName) employeeName.value = employee.name || '';
        if (employeeRole) employeeRole.value = employee.role || '';
        if (employeeDescription) employeeDescription.value = employee.description || '';
        if (employeeExpertise) employeeExpertise.value = (employee.expertise || []).join(', ');
        if (employeePhotoUrl) employeePhotoUrl.value = employee.photo || '';
        if (employeeVerified) employeeVerified.checked = employee.verified || false;

        // Mostrar prévia da foto
        if (employee.photo && DOMCache.employeePreviewImage) {
            DOMCache.employeePreviewImage.src = employee.photo;
            DOMCache.employeePreviewImage.style.display = 'block';
        }

        if (DOMCache.employeeModalTitle) DOMCache.employeeModalTitle.textContent = 'Editar Funcionário';
        if (DOMCache.employeeModalSubtitle) DOMCache.employeeModalSubtitle.textContent = 'Edite os dados do funcionário';
    } else {
        // Criar novo funcionário
        const employeeFormId = document.getElementById('employeeFormId');
        const employeeName = document.getElementById('employeeName');
        const employeeRole = document.getElementById('employeeRole');
        const employeeDescription = document.getElementById('employeeDescription');
        const employeeExpertise = document.getElementById('employeeExpertise');
        const employeePhotoUrl = document.getElementById('employeePhotoUrl');
        const employeeVerified = document.getElementById('employeeVerified');

        if (employeeFormId) employeeFormId.value = '';
        if (employeeName) employeeName.value = '';
        if (employeeRole) employeeRole.value = '';
        if (employeeDescription) employeeDescription.value = '';
        if (employeeExpertise) employeeExpertise.value = '';
        if (employeePhotoUrl) employeePhotoUrl.value = '';
        if (employeeVerified) employeeVerified.checked = false;

        // Limpar prévia da foto
        if (DOMCache.employeePreviewImage) {
            DOMCache.employeePreviewImage.src = '';
            DOMCache.employeePreviewImage.style.display = 'none';
        }

        if (DOMCache.employeeModalTitle) DOMCache.employeeModalTitle.textContent = 'Criar Novo Funcionário';
        if (DOMCache.employeeModalSubtitle) DOMCache.employeeModalSubtitle.textContent = 'Preencha os dados do funcionário';
    }

    if (DOMCache.employeeModal) DOMCache.employeeModal.classList.add('active');
}

function closeEmployeeModal() {
    if (DOMCache.employeeModal) DOMCache.employeeModal.classList.remove('active');
    if (DOMCache.employeeForm) DOMCache.employeeForm.reset();
    if (DOMCache.employeePreviewImage) {
        DOMCache.employeePreviewImage.src = '';
        DOMCache.employeePreviewImage.style.display = 'none';
    }
}

async function handleEmployeePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const imageUrl = await uploadImageToImgBB(file);
        const employeePhotoUrl = document.getElementById('employeePhotoUrl');
        if (employeePhotoUrl) employeePhotoUrl.value = imageUrl;

        // Mostrar prévia
        if (DOMCache.employeePreviewImage) {
            DOMCache.employeePreviewImage.src = imageUrl;
            DOMCache.employeePreviewImage.style.display = 'block';
        }

        showSuccess('Foto carregada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao fazer upload da foto:', error);
        showError('Erro ao fazer upload da foto');
    }
}

async function handleEmployeeSubmit(e) {
    e.preventDefault();

    const employeeId = document.getElementById('employeeFormId') ? document.getElementById('employeeFormId').value : '';
    const employeeName = document.getElementById('employeeName') ? document.getElementById('employeeName').value.trim() : '';
    const employeeRole = document.getElementById('employeeRole') ? document.getElementById('employeeRole').value.trim() : '';
    const employeeDescription = document.getElementById('employeeDescription') ? document.getElementById('employeeDescription').value.trim() : '';
    const employeeExpertiseInput = document.getElementById('employeeExpertise') ? document.getElementById('employeeExpertise').value.trim() : '';
    const employeePhotoUrl = document.getElementById('employeePhotoUrl') ? document.getElementById('employeePhotoUrl').value.trim() : '';
    const employeeVerified = document.getElementById('employeeVerified') ? document.getElementById('employeeVerified').checked : false;

    // Validação
    if (!employeeName || !employeeRole || !employeeDescription) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        toggleLoading(DOMCache.saveEmployeeBtn, DOMCache.saveEmployeeText, DOMCache.saveEmployeeLoading, true);

        const employeeData = {
            name: employeeName,
            role: employeeRole,
            description: employeeDescription,
            expertise: employeeExpertiseInput ? employeeExpertiseInput.split(',').map(f => f.trim()).filter(f => f) : [],
            photo: employeePhotoUrl || 'https://i.imgur.com/7R0l7cO.png',
            verified: employeeVerified,
            updatedAt: Date.now()
        };

        if (employeeId) {
            // Atualizar funcionário existente
            await employeesRef.child(employeeId).update(employeeData);
            showSuccess('Funcionário atualizado com sucesso!');
        } else {
            // Criar novo funcionário
            employeeData.createdAt = Date.now();
            employeeData.rating = 0;
            const newEmployeeRef = employeesRef.push();
            await newEmployeeRef.set(employeeData);
            showSuccess('Funcionário criado com sucesso!');
        }

        closeEmployeeModal();
        loadEmployees();

    } catch (error) {
        console.error('❌ Erro ao salvar funcionário:', error);
        showError('Erro ao salvar funcionário. Tente novamente.');
    } finally {
        toggleLoading(DOMCache.saveEmployeeBtn, DOMCache.saveEmployeeText, DOMCache.saveEmployeeLoading, false);
    }
}

function openCandidateModal(candidateId) {
    const candidate = AppState.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Atualizar informações do modal
    if (DOMCache.candidateRole) DOMCache.candidateRole.textContent = candidate.role;

    let infoHtml = `
        <div class="candidate-info-item">
            <h4>Nome Completo</h4>
            <p>${candidate.firstName} ${candidate.lastName}</p>
        </div>
        <div class="candidate-info-item">
            <h4>Data de Nascimento</h4>
            <p>${candidate.birthDate}</p>
        </div>
        <div class="candidate-info-item">
            <h4>Contato</h4>
            <p>Email: ${candidate.email}</p>
            <p>Telefone: ${candidate.phone}</p>
        </div>
        <div class="candidate-info-item">
            <h4>Endereço</h4>
            <p>${candidate.address}, ${candidate.addressNumber} ${candidate.complement ? '- ' + candidate.complement : ''}</p>
        </div>
        <div class="candidate-info-item">
            <h4>Sobre</h4>
            <p>${candidate.aboutYou}</p>
        </div>
        <div class="candidate-info-item">
            <h4>Experiência</h4>
            <p>${candidate.experience}</p>
        </div>
    `;

    if (candidate.curriculoUrl) {
        infoHtml += `
            <div class="candidate-info-item">
                <h4>Currículo</h4>
                <p><a href="${candidate.curriculoUrl}" target="_blank">Visualizar Currículo</a></p>
            </div>
        `;
    }

    if (DOMCache.candidateInfo) DOMCache.candidateInfo.innerHTML = infoHtml;
    if (DOMCache.whatsappCandidateBtn) DOMCache.whatsappCandidateBtn.dataset.phone = candidate.phone;
    if (DOMCache.candidateModal) DOMCache.candidateModal.classList.add('active');
}

function closeCandidateModal() {
    if (DOMCache.candidateModal) DOMCache.candidateModal.classList.remove('active');
}

// ============================
// FUNÇÕES DO DASHBOARD
// ============================

async function editPlan(planId) {
    openPlanModal(planId);
}

async function deletePlan(planId) {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
        await plansRef.child(planId).remove();
        showSuccess('Plano excluído com sucesso!');
        loadPlans();
    } catch (error) {
        console.error('❌ Erro ao excluir plano:', error);
        showError('Erro ao excluir plano');
    }
}

async function togglePlanPromotion(planId) {
    const plan = AppState.plans.find(p => p.id === planId);
    if (!plan) return;

    try {
        await plansRef.child(planId).update({ promotion: !plan.promotion });
        showSuccess(`Plano ${!plan.promotion ? 'marcado como promoção' : 'removido das promoções'}!`);
        loadPlans();
    } catch (error) {
        console.error('❌ Erro ao atualizar promoção:', error);
        showError('Erro ao atualizar promoção');
    }
}

async function editEmployee(employeeId) {
    openEmployeeModal(employeeId);
}

async function deleteEmployee(employeeId) {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
        await employeesRef.child(employeeId).remove();
        showSuccess('Funcionário excluído com sucesso!');
        loadEmployees();
    } catch (error) {
        console.error('❌ Erro ao excluir funcionário:', error);
        showError('Erro ao excluir funcionário');
    }
}

async function toggleEmployeeVerified(employeeId) {
    const employee = AppState.employees.find(e => e.id === employeeId);
    if (!employee) return;

    try {
        await employeesRef.child(employeeId).update({ verified: !employee.verified });
        showSuccess(`Funcionário ${!employee.verified ? 'verificado' : 'removido da verificação'}!`);
        loadEmployees();
    } catch (error) {
        console.error('❌ Erro ao atualizar verificação:', error);
        showError('Erro ao atualizar verificação');
    }
}

async function deleteComment(commentId) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    try {
        // Obter a avaliação para atualizar o rating do funcionário
        const rating = AppState.ratings.find(r => r.id === commentId);

        // Remover a avaliação
        await ratingsRef.child(commentId).remove();

        // Atualizar rating do funcionário
        if (rating && rating.employeeId) {
            await updateEmployeeRating(rating.employeeId);
        }

        showSuccess('Avaliação excluída com sucesso!');
        loadDashboardComments();
    } catch (error) {
        console.error('❌ Erro ao excluir avaliação:', error);
        showError('Erro ao excluir avaliação');
    }
}

async function deleteCandidate(candidateId) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) return;

    try {
        await candidatesRef.child(candidateId).remove();
        showSuccess('Candidato excluído com sucesso!');
        loadCandidates();
    } catch (error) {
        console.error('❌ Erro ao excluir candidato:', error);
        showError('Erro ao excluir candidato');
    }
}

async function contactCandidate(candidateId) {
    const candidate = AppState.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const phone = candidate.phone.replace(/\D/g, '');
    openCandidateWhatsApp(phone);
}

async function deletePreCadastro(preCadastroId) {
    if (!confirm("Tem certeza que deseja excluir este pré-cadastro?")) return;

    try {
        await preCadastrosRef.child(preCadastroId).remove();
        showSuccess('Pré-cadastro excluído com sucesso!');
        loadPreCadastros();
    } catch (error) {
        console.error('❌ Erro ao excluir pré-cadastro:', error);
        showError('Erro ao excluir pré-cadastro');
    }
}

async function updateEmployeeRating(employeeId) {
    try {
        const snapshot = await ratingsRef.orderByChild('employeeId').equalTo(employeeId).once('value');
        let totalRating = 0;
        let count = 0;

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            totalRating += data.rating || 0;
            count++;
        });

        const newRating = count > 0 ? (totalRating / count).toFixed(1) : 0;
        await employeesRef.child(employeeId).update({ rating: parseFloat(newRating) });

        // Atualizar UI local
        const employeeIndex = AppState.employees.findIndex(e => e.id === employeeId);
        if (employeeIndex !== -1) {
            AppState.employees[employeeIndex].rating = parseFloat(newRating);
            renderEmployees();
            renderDashboardEmployees();
            renderCommentsSection();
        }

    } catch (error) {
        console.error('❌ Erro ao atualizar avaliação do funcionário:', error);
    }
}

function updateEmployeesWithRatings() {
    AppState.employees.forEach(employee => {
        const employeeRatings = AppState.ratings.filter(r => r.employeeId === employee.id);

        if (employeeRatings.length > 0) {
            const totalRating = employeeRatings.reduce((sum, r) => sum + (r.rating || 0), 0);
            employee.rating = (totalRating / employeeRatings.length).toFixed(1);
        } else {
            employee.rating = 0;
        }
    });

    if (DOMCache.employeesList && DOMCache.employeesList.innerHTML) {
        renderEmployees();
    }
}

// ============================
// FUNÇÕES ÚTEIS
// ============================

function toggleLoading(button, textElement, loadingElement, isLoading) {
    if (!button || !textElement || !loadingElement) return;

    AppState.isLoading = isLoading;

    if (isLoading) {
        textElement.classList.add('hidden');
        loadingElement.classList.remove('hidden');
        button.disabled = true;
    } else {
        textElement.classList.remove('hidden');
        loadingElement.classList.add('hidden');
        button.disabled = false;
    }
}

function showError(message) {
    alert(`❌ Erro: ${message}`);
}

function showSuccess(message) {
    alert(`✅ Sucesso: ${message}`);
}

function showLoginError(message) {
    if (DOMCache.loginError) {
        DOMCache.loginError.textContent = message;
        DOMCache.loginError.style.display = 'block';
    }
}

function loadFallbackData() {
    console.log('📱 Carregando dados de exemplo...');

    if (AppState.plans.length === 0) {
        AppState.plans = [{
            id: 'demo1',
            name: 'PLANO BLACK',
            price: 89.90,
            period: 'mensal',
            description: 'Plano completo com acesso a todas as áreas da academia',
            features: ['Acesso ilimitado à academia', 'Aulas de musculação', 'Aulas de aeróbico', 'Avaliação física mensal'],
            promotion: true,
            featured: true,
            clicks: 0
        }, {
            id: 'demo2',
            name: 'PLANO PREMIUM',
            price: 129.90,
            period: 'mensal',
            description: 'Plano premium com acompanhamento personalizado',
            features: ['Acesso ilimitado', 'Personal trainer 2x por semana', 'Avaliação nutricional', 'Acesso a todas as aulas'],
            promotion: false,
            featured: false,
            clicks: 0
        }];
        renderPlans();
    }

    if (AppState.employees.length === 0) {
        AppState.employees = [{
            id: 'demo1',
            name: 'Carlos Silva',
            role: 'Personal Trainer',
            description: 'Profissional com 10 anos de experiência em treinamento físico, especializado em emagrecimento e hipertrofia.',
            expertise: ['Emagrecimento', 'Hipertrofia', 'Nutrição Esportiva'],
            photo: 'https://i.imgur.com/7R0l7cO.png',
            verified: true,
            rating: 4.5
        }, {
            id: 'demo2',
            name: 'Ana Paula Costa',
            role: 'Nutricionista Esportiva',
            description: 'Nutricionista especializada em dietas para atletas e praticantes de atividade física.',
            expertise: ['Nutrição Esportiva', 'Dietas Personalizadas', 'Suplementação'],
            photo: 'https://i.imgur.com/7R0l7cO.png',
            verified: true,
            rating: 4.8
        }];
        renderEmployees();
        renderRoleFilters();
        renderCommentsSection();
    }

    // Carregar dados padrão para outras seções
    if (AppState.platformImages.length === 0) {
        loadDefaultPlatformImages();
        updatePlatformImagesUI();
    }

    if (AppState.apps.length === 0) {
        loadDefaultApps();
        updateAppsUI();
    }
}

// ============================
// INICIALIZAR APLICAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', initializeApp);

function handleDynamicClickEvents(e) {
    // Botões de avaliação nos cards de funcionários
    if (e.target.closest('.btn-rate-employee')) {
        const btn = e.target.closest('.btn-rate-employee');
        const employeeId = btn.dataset.id;
        openRatingModal(employeeId);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Botões de ver comentários
    if (e.target.closest('.btn-view-comments')) {
        const btn = e.target.closest('.btn-view-comments');
        const employeeId = btn.dataset.id;
        openCommentsModal(employeeId);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Botões de contratar plano
    if (e.target.closest('.btn-plan')) {
        const btn = e.target.closest('.btn-plan');
        if (!btn.id && btn.dataset.id && btn.dataset.name) {
            const planId = btn.dataset.id;
            const planName = btn.dataset.name;
            openWhatsApp('plan', planName);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    // Botões de ação no dashboard
    if (e.target.closest('.btn-action')) {
        const btn = e.target.closest('.btn-action');
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'editPlan') editPlan(id);
        if (action === 'deletePlan') deletePlan(id);
        if (action === 'togglePromotion') togglePlanPromotion(id);
        if (action === 'editEmployee') editEmployee(id);
        if (action === 'deleteEmployee') deleteEmployee(id);
        if (action === 'toggleVerified') toggleEmployeeVerified(id);
        if (action === 'deleteComment') deleteComment(id);
        if (action === 'deleteCandidate') deleteCandidate(id);
        if (action === 'contactCandidate') contactCandidate(id);
        if (action === 'deletePreCadastro') deletePreCadastro(id);
        if (action === 'deletePlatformImage') deletePlatformImage(id);
        if (action === 'deleteGalleryImage') deleteGalleryImage(id);
        if (action === 'deleteApp') deleteApp(id);
        if (action === 'deletePartner') deletePartner(id);
    }

    // Botões WhatsApp dos candidatos
    if (e.target.closest('.btn-whatsapp') && e.target.closest('.btn-whatsapp').dataset.phone) {
        const btn = e.target.closest('.btn-whatsapp');
        const phone = btn.dataset.phone;
        openCandidateWhatsApp(phone);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}
