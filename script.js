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
let hiddenRolesRef = null;
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
    hiddenRoles: [],
    currentFilter: 'all',
    platformImages: [],
    galleryImages: [],
    apps: [],
    partners: []
};

// Cache de elementos DOM
const DOMCache = {};

// ============================
// INICIALIZAÇÃO
// ============================

async function initializeApp() {
    console.log('🚀 Inicializando aplicação...');

    try {
        // 1. Verificar se Firebase está carregado
        if (typeof firebase === 'undefined') {
            showError('Firebase não carregado! Recarregue a página.');
            return;
        }

        console.log('✅ Firebase carregado. Versão:', firebase.SDK_VERSION);

        // 2. Cachear elementos DOM
        cacheDOMElements();

        // 3. Configurar event listeners
        setupEventListeners();

        // 4. Configurar ano atual no footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // 5. Configurar data máxima para nascimento (18 anos atrás)
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        document.getElementById('birthDate').max = maxDate.toISOString().split('T')[0];
        document.getElementById('preDataNascimento').max = maxDate.toISOString().split('T')[0];

        // 6. Inicializar Firebase
        await initializeFirebase();

        // 7. Carregar configurações
        await loadConfig();

        // 8. Verificar autenticação
        await checkAuthState();

        // 9. Carregar dados iniciais se não estiver logado
        if (!AppState.isLoggedIn) {
            await loadInitialData();
        }

        // 10. Mostrar mensagem de boas-vindas
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);

        console.log('🎉 Aplicação inicializada com sucesso!');

    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError('Erro ao inicializar a aplicação: ' + error.message);
    }
}

async function initializeFirebase() {
    try {
        console.log('🔥 Inicializando Firebase com Realtime Database...');

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

        console.log('✅ Firebase inicializado com sucesso!');

        // Configurar referências
        plansRef = database.ref('plans');
        employeesRef = database.ref('employees');
        ratingsRef = database.ref('ratings');
        configRef = database.ref('config');
        usersRef = database.ref('users');
        candidatesRef = database.ref('candidates');
        hiddenRolesRef = database.ref('hiddenRoles');
        preCadastrosRef = database.ref('preCadastros');
        platformImagesRef = database.ref('platformImages');
        galleryRef = database.ref('gallery');
        logoRef = database.ref('logo');
        appsRef = database.ref('apps');
        partnersRef = database.ref('partners');

        // Testar conexão
        await testDatabaseConnection();

        return true;

    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        showError('Erro ao conectar com o banco de dados: ' + error.message);
        return false;
    }
}

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testando conexão com Realtime Database...');

        // Teste simples
        await database.ref('test/connection').set({
            message: 'Conexão estabelecida',
            timestamp: Date.now()
        });

        console.log('✅ Conexão com Realtime Database estabelecida!');

        // Remover dados de teste após 5 segundos
        setTimeout(() => {
            database.ref('test').remove();
        }, 5000);

        return true;

    } catch (error) {
        console.error('❌ Erro na conexão com o banco de dados:', error);
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
    DOMCache.footerWorkWithUsBtn = document.getElementById('footerWorkWithUsBtn');
    DOMCache.footerPreCadastroBtn = document.getElementById('footerPreCadastroBtn');
    DOMCache.footerWhatsAppBtn = document.getElementById('footerWhatsAppBtn');
    DOMCache.dashboardLinkFooter = document.getElementById('dashboardLinkFooter');
    DOMCache.verPlanosGalleryBtn = document.getElementById('verPlanosGalleryBtn');

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

    // Abas do Dashboard
    DOMCache.dashboardTabs = document.getElementById('dashboardTabs');
    DOMCache.dashboardPlansList = document.getElementById('dashboardPlansList');
    DOMCache.dashboardEmployeesList = document.getElementById('dashboardEmployeesList');
    DOMCache.dashboardCommentsList = document.getElementById('dashboardCommentsList');
    DOMCache.candidatesList = document.getElementById('candidatesList');
    DOMCache.preCadastrosList = document.getElementById('preCadastrosList');
    DOMCache.accessList = document.getElementById('accessList');
    DOMCache.filterComments = document.getElementById('filterComments');
    DOMCache.clearFilterBtn = document.getElementById('clearFilterBtn');
    DOMCache.hiddenRolesList = document.getElementById('hiddenRolesList');
    DOMCache.refreshHiddenRolesBtn = document.getElementById('refreshHiddenRolesBtn');

    // Botões do Dashboard
    DOMCache.addPlanBtn = document.getElementById('addPlanBtn');
    DOMCache.addEmployeeBtn = document.getElementById('addEmployeeBtn');
    DOMCache.addAccessBtn = document.getElementById('addAccessBtn');

    // Footer
    DOMCache.footerDescription = document.getElementById('footerDescription');
    DOMCache.footerAddress = document.getElementById('footerAddress');
    DOMCache.footerPhone = document.getElementById('footerPhone');
    DOMCache.footerEmail = document.getElementById('footerEmail');
    DOMCache.footerHours = document.getElementById('footerHours');
    DOMCache.sidebarTitle = document.getElementById('sidebarTitle');
    DOMCache.pageTitle = document.getElementById('pageTitle');
}

function setupEventListeners() {
    // Menu lateral
    DOMCache.menuToggle.addEventListener('click', openSidebar);
    DOMCache.closeSidebar.addEventListener('click', closeSidebar);
    DOMCache.overlay.addEventListener('click', closeSidebar);
    DOMCache.homeLogo.addEventListener('click', () => scrollToSection('hero'));

    // Botão de Suporte
    DOMCache.supportBtn.addEventListener('click', () => openWhatsApp('contact'));

    // Navegação
    DOMCache.whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        openWhatsApp('contact');
    });

    DOMCache.workWithUsSidebarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        openWorkModal();
    });

    DOMCache.preCadastroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        openPreCadastroModal();
    });

    DOMCache.academiaFotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        scrollToSection('academiaGallery');
    });

    DOMCache.dashboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        showDashboard();
    });

    DOMCache.footerWorkWithUsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWorkModal();
    });

    DOMCache.footerPreCadastroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openPreCadastroModal();
    });

    DOMCache.footerWhatsAppBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsApp('contact');
    });

    DOMCache.dashboardLinkFooter.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });

    DOMCache.verPlanosGalleryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('plans');
    });

    // Modal Pré-cadastro
    DOMCache.closePreCadastroModal.addEventListener('click', closePreCadastroModal);
    DOMCache.cancelPreCadastroBtn.addEventListener('click', closePreCadastroModal);
    DOMCache.preCadastroForm.addEventListener('submit', handlePreCadastroSubmit);

    // CEP Auto-complete
    document.getElementById('preCEP').addEventListener('blur', buscarCEP);

    // Modal de avaliação
    DOMCache.closeRatingModal.addEventListener('click', closeRatingModal);
    DOMCache.cancelRatingBtn.addEventListener('click', closeRatingModal);
    DOMCache.ratingForm.addEventListener('submit', handleRatingSubmit);

    // Modal de comentários
    DOMCache.closeCommentsModal.addEventListener('click', closeCommentsModal);
    DOMCache.closeCommentsBtn.addEventListener('click', closeCommentsModal);

    // Modal trabalhe conosco
    DOMCache.closeWorkModal.addEventListener('click', closeWorkModal);
    DOMCache.closeWorkOptionsBtn.addEventListener('click', closeWorkModal);

    // Opções de trabalho
    DOMCache.workOptions.forEach(option => {
        option.addEventListener('click', () => {
            const role = option.dataset.role;
            openWorkFormModal(role);
        });
    });

    // Modal formulário trabalhe conosco
    DOMCache.closeWorkFormModal.addEventListener('click', closeWorkFormModal);
    DOMCache.cancelWorkFormBtn.addEventListener('click', closeWorkFormModal);
    DOMCache.workForm.addEventListener('submit', handleWorkFormSubmit);

    // Modal de configurações
    DOMCache.openConfigBtn.addEventListener('click', openConfigModal);
    DOMCache.closeConfigModal.addEventListener('click', closeConfigModal);
    DOMCache.cancelConfigBtn.addEventListener('click', closeConfigModal);
    DOMCache.configForm.addEventListener('submit', handleConfigSubmit);
    DOMCache.uploadLogoBtn.addEventListener('click', () => DOMCache.logoUploadInput.click());
    DOMCache.logoUploadInput.addEventListener('change', handleLogoUpload);
    DOMCache.uploadGalleryBtn.addEventListener('click', () => DOMCache.galleryUploadInput.click());
    DOMCache.galleryUploadInput.addEventListener('change', handleGalleryUpload);
    DOMCache.clearGalleryBtn.addEventListener('click', clearGallery);
    DOMCache.addMorePlatformsBtn.addEventListener('click', addPlatformImageFromDashboard);

    // Botões de gerenciamento de imagens de plataformas
    DOMCache.addPlatformImageBtn.addEventListener('click', addPlatformImage);
    DOMCache.removePlatformImageBtn.addEventListener('click', removePlatformImage);
    DOMCache.addPlatformImageDashboardBtn.addEventListener('click', addPlatformImageFromDashboard);
    DOMCache.removePlatformImageDashboardBtn.addEventListener('click', removePlatformImageFromDashboard);

    // Galeria Dashboard
    DOMCache.uploadGalleryDashboardBtn.addEventListener('click', () => DOMCache.galleryDashboardUpload.click());
    DOMCache.galleryDashboardUpload.addEventListener('change', handleGalleryUploadDashboard);
    DOMCache.clearGalleryDashboardBtn.addEventListener('click', clearGalleryDashboard);

    // Apps
    DOMCache.addAppBtn.addEventListener('click', addApp);
    DOMCache.addAppDashboardBtn.addEventListener('click', addAppDashboard);

    // Parcerias
    DOMCache.addPartnerBtn.addEventListener('click', addPartner);
    DOMCache.addPartnerDashboardBtn.addEventListener('click', addPartnerDashboard);

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
    DOMCache.loginForm.addEventListener('submit', handleLogin);

    // Dashboard
    DOMCache.logoutBtn.addEventListener('click', handleLogout);
    DOMCache.dashboardLogo.addEventListener('click', () => {
        if (AppState.isLoggedIn) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    DOMCache.refreshHiddenRolesBtn.addEventListener('click', loadHiddenRoles);

    // Abas do Dashboard
    DOMCache.dashboardTabs.addEventListener('click', (e) => {
        if (e.target.closest('.dashboard-tab')) {
            const tab = e.target.closest('.dashboard-tab');
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        }
    });

    // Filtros de busca
    DOMCache.filterComments.addEventListener('input', filterComments);
    DOMCache.clearFilterBtn.addEventListener('click', () => {
        DOMCache.filterComments.value = '';
        filterComments();
    });

    // Botões do Dashboard
    DOMCache.addPlanBtn.addEventListener('click', addPlan);
    DOMCache.addEmployeeBtn.addEventListener('click', addEmployee);
    DOMCache.addAccessBtn.addEventListener('click', addAccess);
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
        DOMCache.logoPreviewImage.src = e.target.result;
        DOMCache.logoPreviewImage.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload para ImgBB
    try {
        const imageUrl = await uploadImageToImgBB(file);
        document.getElementById('configLogoUrl').value = imageUrl;
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
// FUNÇÕES DE UPLOAD DE FUNCIONÁRIO (CORRIGIDAS)
// ============================

async function addEmployee() {
    try {
        const name = prompt("Nome do funcionário:");
        if (!name) return;

        const role = prompt("Cargo:", "Personal Trainer");
        const description = prompt("Descrição:", "Profissional dedicado com anos de experiência em treinamento físico e nutrição esportiva.");
        const expertiseInput = prompt("Especialidades (separadas por vírgula):", "Personal Training, Nutrição Esportiva");
        const verified = confirm("Este funcionário é verificado?");

        // CAMPO DE ENTRADA PARA URL DA FOTO
        let photoUrl = prompt("URL da foto (ImgBB) - deixe em branco para usar imagem padrão:", "");

        // SE O USUÁRIO DEIXAR EM BRANCO, PERMITIR UPLOAD DE IMAGEM
        if (!photoUrl || photoUrl.trim() === "") {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';

            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    // Se o usuário cancelou o upload, usar imagem padrão
                    photoUrl = "https://i.imgur.com/7R0l7cO.png";
                    await saveEmployeeData(name, role, description, expertiseInput, photoUrl, verified);
                    return;
                }

                try {
                    const uploadedPhotoUrl = await uploadImageToImgBB(file);
                    photoUrl = uploadedPhotoUrl;
                    await saveEmployeeData(name, role, description, expertiseInput, photoUrl, verified);
                } catch (error) {
                    console.error('❌ Erro ao fazer upload da foto:', error);
                    showError('Erro ao fazer upload da foto. Usando imagem padrão.');
                    photoUrl = "https://i.imgur.com/7R0l7cO.png";
                    await saveEmployeeData(name, role, description, expertiseInput, photoUrl, verified);
                }
            };

            fileInput.click();
        } else {
            // Se o usuário forneceu uma URL, usar diretamente
            await saveEmployeeData(name, role, description, expertiseInput, photoUrl, verified);
        }

    } catch (error) {
        console.error('❌ Erro ao criar funcionário:', error);
        showError('Erro ao criar funcionário');
    }
}

async function saveEmployeeData(name, role, description, expertiseInput, photoUrl, verified) {
    try {
        const newEmployee = {
            name: name.trim(),
            role: role.trim(),
            description: description.trim(),
            expertise: expertiseInput ? expertiseInput.split(',').map(e => e.trim()) : [],
            photo: photoUrl.trim() || "https://i.imgur.com/7R0l7cO.png",
            verified,
            rating: 0,
            createdAt: Date.now()
        };

        const newEmployeeRef = employeesRef.push();
        await newEmployeeRef.set(newEmployee);
        showSuccess('Funcionário criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao salvar dados do funcionário:', error);
        showError('Erro ao salvar dados do funcionário');
    }
}

async function editEmployee(employeeId) {
    const employee = AppState.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const name = prompt("Nome do funcionário:", employee.name);
    if (!name) return;

    const role = prompt("Cargo:", employee.role);
    const description = prompt("Descrição:", employee.description);
    const expertise = prompt("Especialidades (separadas por vírgula):", (employee.expertise || []).join(', '));

    // CAMPO DE ENTRADA PARA URL DA FOTO COM OPÇÃO DE UPLOAD
    let photoUrl = prompt("URL da foto (ImgBB) - deixe em branco para manter atual ou digite 'upload' para fazer upload:", employee.photo || '');

    if (photoUrl === 'upload') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) {
                photoUrl = employee.photo || "https://i.imgur.com/7R0l7cO.png";
                await updateEmployeeData(employeeId, name, role, description, expertise, photoUrl);
                return;
            }

            try {
                const uploadedPhotoUrl = await uploadImageToImgBB(file);
                photoUrl = uploadedPhotoUrl;
                await updateEmployeeData(employeeId, name, role, description, expertise, photoUrl);
            } catch (error) {
                console.error('❌ Erro ao fazer upload da foto:', error);
                showError('Erro ao fazer upload da foto. Mantendo foto atual.');
                photoUrl = employee.photo || "https://i.imgur.com/7R0l7cO.png";
                await updateEmployeeData(employeeId, name, role, description, expertise, photoUrl);
            }
        };

        fileInput.click();
    } else if (photoUrl === '') {
        // Se deixar em branco, manter foto atual
        photoUrl = employee.photo || "https://i.imgur.com/7R0l7cO.png";
        await updateEmployeeData(employeeId, name, role, description, expertise, photoUrl);
    } else {
        // Se forneceu uma URL, usar diretamente
        await updateEmployeeData(employeeId, name, role, description, expertise, photoUrl);
    }
}

async function updateEmployeeData(employeeId, name, role, description, expertise, photoUrl) {
    try {
        const updates = {
            name,
            role,
            description,
            expertise: expertise ? expertise.split(',').map(e => e.trim()) : [],
            photo: photoUrl || ''
        };

        await employeesRef.child(employeeId).update(updates);
        showSuccess('Funcionário atualizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar funcionário:', error);
        showError('Erro ao atualizar funcionário');
    }
}

// ============================
// PLATAFORMAS ACEITAS
// ============================

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

// ============================
// GALERIA DA ACADEMIA
// ============================

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
        DOMCache.galleryDashboardUpload.value = '';
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

async function loadGalleryImages() {
    try {
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
    if (AppState.galleryImages.length > 0) {
        DOMCache.academiaGallery.style.display = 'block';
        DOMCache.academiaFotoBtn.style.display = 'block';

        let galleryHtml = '';
        AppState.galleryImages.forEach(image => {
            galleryHtml += `
                <img src="${image.url}" alt="Academia" class="gallery-image">
            `;
        });
        DOMCache.galleryContainer.innerHTML = galleryHtml;
    } else {
        DOMCache.academiaGallery.style.display = 'none';
        DOMCache.academiaFotoBtn.style.display = 'none';
    }

    // Atualizar configurações
    if (document.getElementById('galleryConfigList')) {
        let configHtml = '';
        if (AppState.galleryImages.length > 0) {
            AppState.galleryImages.forEach((image, index) => {
                configHtml += `
                    <div class="platform-config-item">
                        <img src="${image.url}" alt="Galeria ${index + 1}" class="platform-config-img">
                        <p>Imagem ${index + 1}</p>
                    </div>
                `;
            });
        } else {
            configHtml = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma imagem na galeria.</p>';
        }
        document.getElementById('galleryConfigList').innerHTML = configHtml;
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
            name: "Gaga",
            icon: "https://i.ibb.co/jkq0QvRz/image.png",
            link: "#"
        },
        {
            name: "Gym",
            icon: "https://i.ibb.co/P8X8wZd/image.png",
            link: "#"
        },
        {
            name: "Just me",
            icon: "https://i.ibb.co/svX3B8q7/image.png",
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

async function addAppDashboard() {
    await addApp();
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
                    <div class="partner-card">
                        <div class="partner-header">
                            <img src="${partner.logo}" alt="${partner.name}" class="partner-logo">
                            <div class="partner-info">
                                <div class="partner-name">
                                    ${partner.name}
                                    ${partner.instagram ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                                </div>
                            </div>
                        </div>
                        <a href="${partner.link}" target="_blank" class="partner-link">
                            Visitar Site
                        </a>
                    </div>
                `;
            });
        } else {
            // Não exibir nada se não houver parcerias
            html = '';
        }

        DOMCache.partnersContainer.innerHTML = html;

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

async function addPartnerDashboard() {
    await addPartner();
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
        if (AppState.platformImages.length >= 3) {
            DOMCache.addMorePlatformsBtn.style.display = 'block';
        } else {
            DOMCache.addMorePlatformsBtn.style.display = 'none';
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
    DOMCache.preCadastroModal.classList.add('active');
}

function closePreCadastroModal() {
    DOMCache.preCadastroModal.classList.remove('active');
    DOMCache.preCadastroForm.reset();
    document.getElementById('preRua').value = '';
}

async function buscarCEP() {
    const cep = document.getElementById('preCEP').value.replace(/\D/g, '');

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

        document.getElementById('preRua').value = data.logradouro;

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError('Erro ao buscar CEP. Tente novamente.');
    }
}

async function handlePreCadastroSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('preNome').value.trim();
    const sobrenome = document.getElementById('preSobrenome').value.trim();
    const dataNascimento = document.getElementById('preDataNascimento').value;
    const genero = document.getElementById('preGenero').value;
    const cpf = document.getElementById('preCPF').value.trim();
    const rg = document.getElementById('preRG').value.trim();
    const cep = document.getElementById('preCEP').value.trim();
    const rua = document.getElementById('preRua').value.trim();
    const numero = document.getElementById('preNumero').value.trim();
    const complemento = document.getElementById('preComplemento').value.trim();
    const telefone = document.getElementById('preTelefone').value.trim();
    const email = document.getElementById('preEmail').value.trim();

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
        // Carregar configurações gerais
        configRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                AppState.config = { ...AppState.config, ...data };
                updateConfigUI();
            }
        });

        // Carregar logo
        logoRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const logoUrl = snapshot.val();
                if (logoUrl) {
                    updateLogo(logoUrl);
                }
            }
        });

        // Carregar imagens das plataformas
        await loadPlatformImages();

        // Carregar galeria de imagens
        await loadGalleryImages();

        // Carregar apps
        await loadApps();

        // Carregar parcerias
        await loadPartners();

        // Carregar cargos ocultos
        hiddenRolesRef.on('value', (snapshot) => {
            AppState.hiddenRoles = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.hiddenRoles.push({ id: key, ...data[key] });
                });
            }
            renderRoleFilters();
            renderEmployees();

            if (AppState.isLoggedIn) {
                renderHiddenRoles();
            }
        });

    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
    }
}

async function saveConfig() {
    try {
        // Separar configurações por categoria
        const generalConfig = {
            pageTitle: document.getElementById('configPageTitle').value
        };

        const textConfig = {
            welcomeTitle: document.getElementById('configWelcomeTitle').value,
            welcomeSubtitle: document.getElementById('configWelcomeSubtitle').value,
            heroTitle: document.getElementById('configHeroTitle').value,
            heroDescription: document.getElementById('configHeroDescription').value,
            plansSubtitle: document.getElementById('configPlansSubtitle').value,
            employeesSubtitle: document.getElementById('configEmployeesSubtitle').value,
            sidebarText: document.getElementById('configSidebarText').value
        };

        const whatsappConfig = {
            whatsAppNumber: document.getElementById('configWhatsAppNumber').value,
            planMessage: document.getElementById('configPlanMessage').value,
            contactMessage: document.getElementById('configContactMessage').value
        };

        const companyConfig = {
            companyName: document.getElementById('configCompanyName').value,
            companyDescription: document.getElementById('configCompanyDescription').value,
            companyBiography: document.getElementById('configCompanyBiography').value
        };

        const footerConfig = {
            footerAddress: document.getElementById('configFooterAddress').value,
            footerPhone: document.getElementById('configFooterPhone').value,
            footerEmail: document.getElementById('configFooterEmail').value,
            footerHours: document.getElementById('configFooterHours').value
        };

        // Salvar no Firebase
        await configRef.set({ ...generalConfig, ...textConfig, ...whatsappConfig, ...companyConfig, ...footerConfig });

        // Salvar logo separadamente
        const logoUrl = document.getElementById('configLogoUrl').value;
        if (logoUrl) {
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
    DOMCache.pageTitle.textContent = AppState.config.pageTitle;

    // Atualizar logo
    updateLogo(AppState.config.logoUrl);

    // Atualizar textos
    DOMCache.welcomeTitle.textContent = AppState.config.welcomeTitle;
    DOMCache.welcomeSubtitle.textContent = AppState.config.welcomeSubtitle;

    // Separar título do hero (parte antes e depois da vírgula)
    const heroTitleParts = AppState.config.heroTitle.split(', ');
    if (heroTitleParts.length >= 2) {
        DOMCache.heroTitle.innerHTML = `${heroTitleParts[0]}, <span class="highlight">${heroTitleParts[1]}</span>`;
    } else {
        DOMCache.heroTitle.textContent = AppState.config.heroTitle;
    }

    DOMCache.heroDescription.textContent = AppState.config.heroDescription;
    DOMCache.plansSubtitle.textContent = AppState.config.plansSubtitle;
    DOMCache.employeesSubtitle.textContent = AppState.config.employeesSubtitle;
    DOMCache.sidebarFooterText.textContent = AppState.config.sidebarText;
    DOMCache.footerDescription.textContent = AppState.config.companyDescription;
    DOMCache.sidebarTitle.textContent = AppState.config.companyName.split(' ')[0] || 'TARGET';

    // Atualizar inputs do modal de configuração
    document.getElementById('configPageTitle').value = AppState.config.pageTitle;
    document.getElementById('configLogoUrl').value = AppState.config.logoUrl;
    document.getElementById('configWelcomeTitle').value = AppState.config.welcomeTitle;
    document.getElementById('configWelcomeSubtitle').value = AppState.config.welcomeSubtitle;
    document.getElementById('configHeroTitle').value = AppState.config.heroTitle;
    document.getElementById('configHeroDescription').value = AppState.config.heroDescription;
    document.getElementById('configPlansSubtitle').value = AppState.config.plansSubtitle;
    document.getElementById('configEmployeesSubtitle').value = AppState.config.employeesSubtitle;
    document.getElementById('configSidebarText').value = AppState.config.sidebarText;
    document.getElementById('configWhatsAppNumber').value = AppState.config.whatsAppNumber;
    document.getElementById('configPlanMessage').value = AppState.config.planMessage;
    document.getElementById('configContactMessage').value = AppState.config.contactMessage;
    document.getElementById('configCompanyName').value = AppState.config.companyName;
    document.getElementById('configCompanyDescription').value = AppState.config.companyDescription;
    document.getElementById('configCompanyBiography').value = AppState.config.companyBiography;
    document.getElementById('configFooterAddress').value = AppState.config.footerAddress;
    document.getElementById('configFooterPhone').value = AppState.config.footerPhone;
    document.getElementById('configFooterEmail').value = AppState.config.footerEmail;
    document.getElementById('configFooterHours').value = AppState.config.footerHours;
}

function updateLogo(logoUrl) {
    if (logoUrl) {
        DOMCache.mainLogo.src = logoUrl;
        DOMCache.loginLogoImg.src = logoUrl;
        DOMCache.dashboardLogoImg.src = logoUrl;
        DOMCache.footerLogoImg.src = logoUrl;
        document.querySelector('.sidebar-logo').src = logoUrl;
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

// ============================
// FILTRO POR CARGO (CORRIGIDO)
// ============================

function filterEmployeesByRole(role) {
    console.log('=== FILTRANDO FUNCIONÁRIOS ===');
    console.log('Filtro selecionado:', role);
    console.log('Total de funcionários:', AppState.employees.length);
    console.log('Cargos ocultos:', AppState.hiddenRoles);

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
            loadHiddenRoles(),
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

                console.log('Funcionários carregados:', AppState.employees.length);
                console.log('Primeiro funcionário foto:', AppState.employees[0]?.photo);
            }

            renderEmployees();
            renderRoleFilters();

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
        ratingsRef.on('value', (snapshot) => {
            AppState.ratings = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    AppState.ratings.push({ id: key, ...data[key] });
                });

                updateEmployeesWithRatings();
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

            if (AppState.isLoggedIn) {
                renderDashboardUsers();
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
    }
}

async function loadHiddenRoles() {
    try {
        const snapshot = await hiddenRolesRef.once('value');
        AppState.hiddenRoles = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(key => {
                AppState.hiddenRoles.push({ id: key, ...data[key] });
            });
        }

        renderHiddenRoles();
    } catch (error) {
        console.error('❌ Erro ao carregar cargos ocultos:', error);
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

        DOMCache.dashboardCommentsList.innerHTML = html;
    } catch (error) {
        console.error('❌ Erro ao carregar avaliações:', error);
    }
}

// ============================
// RENDERIZAÇÃO (CORRIGIDA)
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

    console.log('=== RENDERIZANDO FUNCIONÁRIOS ===');
    console.log('Filtro atual:', AppState.currentFilter);
    console.log('Total de funcionários:', AppState.employees.length);
    console.log('Total de avaliações:', AppState.ratings.length);
    console.log('Cargos ocultos:', AppState.hiddenRoles);

    let html = '';

    // Filtrar por cargo selecionado
    const filteredEmployees = AppState.currentFilter === 'all' 
        ? AppState.employees 
        : AppState.employees.filter(emp => {
            console.log('Comparando:', emp.role, 'com filtro:', AppState.currentFilter);
            return emp.role === AppState.currentFilter;
        });

    console.log('Funcionários filtrados por cargo:', filteredEmployees.length);

    // Filtrar cargos ocultos
    const hiddenRoles = AppState.hiddenRoles.map(hr => hr.role);
    console.log('Cargos ocultos:', hiddenRoles);

    const visibleEmployees = filteredEmployees.filter(emp => {
        const isHidden = hiddenRoles.includes(emp.role);
        console.log(`Funcionário ${emp.name} (${emp.role}) - Oculto: ${isHidden}`);
        return !isHidden;
    });

    console.log('Funcionários visíveis (sem cargos ocultos):', visibleEmployees.length);

    if (visibleEmployees.length === 0) {
        if (filteredEmployees.length > 0 && AppState.currentFilter !== 'all') {
            html = `<p class="text-center">Nenhum funcionário encontrado para o cargo "${AppState.currentFilter}".</p>`;
        } else {
            html = '<p class="text-center">Nenhum funcionário encontrado.</p>';
        }
    } else {
        visibleEmployees.forEach(employee => {
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
                                Ver Comentários (${commentsCount})
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

    console.log('=== GERANDO FILTROS ===');

    // Coletar cargos únicos (incluindo o filtro "Todos")
    const roles = ['all'];
    const hiddenRoles = AppState.hiddenRoles.map(hr => hr.role);

    AppState.employees.forEach(employee => {
        if (employee.role && !roles.includes(employee.role) && !hiddenRoles.includes(employee.role)) {
            roles.push(employee.role);
        }
    });

    console.log('Cargos disponíveis para filtro:', roles);

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

    console.log('Botões de filtro criados:', DOMCache.roleFilterContainer.querySelectorAll('.filter-btn').length);

    // Adicionar eventos de clique aos botões de filtro
    DOMCache.roleFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        // Remover evento anterior para evitar duplicação
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Adicionar novo evento
        newBtn.addEventListener('click', handleFilterClick);
    });
}

// Função separada para lidar com clique nos filtros
function handleFilterClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const role = btn.dataset.role;
    console.log('Botão de filtro clicado:', role);
    filterEmployeesByRole(role);
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
        const isHidden = AppState.hiddenRoles.some(hr => hr.role === employee.role);

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
                    <p><strong>Status:</strong> ${isHidden ? '<span style="color: #e74c3c;">Oculto (cargo escondido)</span>' : '<span style="color: #27ae60;">Visível</span>'}</p>
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
                    ${!isHidden ? `
                    <button class="btn-action btn-hide" data-action="hideRole" data-role="${employee.role}">
                        <i class="fas fa-eye-slash"></i> Ocultar Cargo
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    DOMCache.dashboardEmployeesList.innerHTML = html || '<p class="text-center">Nenhum funcionário cadastrado.</p>';
}

function renderHiddenRoles() {
    if (!DOMCache.hiddenRolesList) return;

    let html = '';

    if (AppState.hiddenRoles.length > 0) {
        AppState.hiddenRoles.forEach(hiddenRole => {
            html += `
                <div class="dashboard-plan-item">
                    <div class="dashboard-plan-header">
                        <h4 class="dashboard-plan-name">${hiddenRole.role}</h4>
                    </div>
                    <div class="dashboard-plan-details">
                        <p><strong>Oculto desde:</strong> ${new Date(hiddenRole.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p>
                        <p><em>Este cargo não aparece na tela dos alunos</em></p>
                    </div>
                    <div class="dashboard-plan-actions">
                        <button class="btn-action btn-hide" data-action="showRole" data-role="${hiddenRole.role}">
                            <i class="fas fa-eye"></i> Mostrar Cargo
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum cargo oculto no momento.</p>';
    }

    DOMCache.hiddenRolesList.innerHTML = html;
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
                <div class="candidate-item">
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
                        <p><strong>Sobre:</strong> ${candidate.aboutYou}</p>
                        <p><strong>Experiência:</strong> ${candidate.experience}</p>
                        <p><small>Data de candidatura: ${new Date(candidate.createdAt || Date.now()).toLocaleDateString('pt-BR')}</small></p>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum candidato encontrado.</p>';
    }

    DOMCache.candidatesList.innerHTML = html;
}

function renderDashboardUsers() {
    if (!DOMCache.accessList) return;

    let html = '';

    // Adicionar o acesso principal (adielfhellip@gmail.com)
    const mainUser = {
        email: 'adielfhellip@gmail.com',
        name: 'Administrador Principal',
        password: '••••••••'
    };

    html += `
        <div class="access-item">
            <div class="access-info">
                <h4>${mainUser.name}</h4>
                <p class="access-email">${mainUser.email}</p>
                <p class="access-password">${mainUser.password}</p>
                <p><small><em>Acesso principal - não visível para outros usuários</em></small></p>
            </div>
        </div>
    `;

    // Adicionar outros usuários
    AppState.users.forEach(user => {
        if (user.email !== 'adielfhellip@gmail.com') {
            html += `
                <div class="access-item">
                    <div class="access-info">
                        <h4>${user.name || 'Usuário'}</h4>
                        <p class="access-email">${user.email}</p>
                        <p class="access-password">••••••••</p>
                        <p><small>Criado em: ${new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}</small></p>
                    </div>
                    <div class="dashboard-plan-actions">
                        <button class="btn-action btn-delete" data-action="deleteAccess" data-id="${user.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }
    });

    DOMCache.accessList.innerHTML = html;
}

// ============================
// FILTROS
// ============================

function filterComments() {
    const filterText = DOMCache.filterComments.value.toLowerCase();

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

    DOMCache.dashboardCommentsList.innerHTML = html;
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
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                // Usuário está logado
                AppState.currentUser = user;
                AppState.isLoggedIn = true;

                // Atualizar UI
                DOMCache.userAvatar.textContent = user.email.charAt(0).toUpperCase();
                DOMCache.userEmail.textContent = user.email;

                // Mostrar botão do dashboard no menu lateral
                if (DOMCache.dashboardBtn) {
                    DOMCache.dashboardBtn.style.display = 'block';
                }

                // Carregar dados do dashboard
                await loadDashboardData();
                showDashboard();
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

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

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
    DOMCache.sidebar.classList.add('active');
    DOMCache.overlay.classList.add('active');
}

function closeSidebar() {
    DOMCache.sidebar.classList.remove('active');
    DOMCache.overlay.classList.remove('active');
}

function openConfigModal() {
    DOMCache.configModal.classList.add('active');
}

function closeConfigModal() {
    DOMCache.configModal.classList.remove('active');
}

function openWorkModal() {
    DOMCache.workModal.classList.add('active');
}

function closeWorkModal() {
    DOMCache.workModal.classList.remove('active');
}

function openWorkFormModal(role) {
    DOMCache.selectedRole.value = role;
    closeWorkModal();
    DOMCache.workFormModal.classList.add('active');
}

function closeWorkFormModal() {
    DOMCache.workFormModal.classList.remove('active');
    DOMCache.workForm.reset();
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

    DOMCache.ratingEmployeeInfo.innerHTML = employeeInfoHtml;

    // Limpar formulário
    document.getElementById('studentName').value = '';
    document.getElementById('comment').value = '';
    setRating(0);

    // Definir o ID do funcionário no campo hidden
    document.getElementById('employeeId').value = employeeId;

    // Abrir modal
    DOMCache.ratingModal.classList.add('active');
}

function closeRatingModal() {
    DOMCache.ratingModal.classList.remove('active');
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

    const studentName = document.getElementById('studentName').value.trim();
    const comment = document.getElementById('comment').value.trim();
    const ratingStars = document.querySelectorAll('.rating-star-large.active').length;
    const employeeId = document.getElementById('employeeId').value;

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

    const role = DOMCache.selectedRole.value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const email = document.getElementById('candidateEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const addressNumber = document.getElementById('addressNumber').value.trim();
    const complement = document.getElementById('complement').value.trim();
    const aboutYou = document.getElementById('aboutYou').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const curriculoFile = document.getElementById('curriculo').files[0];

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
            <p>${commentsCount} avaliações</p>
        </div>
    `;

    DOMCache.commentsEmployeeInfo.innerHTML = employeeInfoHtml;
    DOMCache.commentsModalTitle.textContent = `Comentários - ${employee.name}`;
    DOMCache.commentsModalSubtitle.textContent = 'Avaliações dos alunos sobre este profissional';

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

    DOMCache.commentsList.innerHTML = commentsHtml;
    DOMCache.commentsModal.classList.add('active');
}

function closeCommentsModal() {
    DOMCache.commentsModal.classList.remove('active');
}

function showWelcomeMessage() {
    DOMCache.welcomeContainer.style.display = 'block';
    setTimeout(() => {
        DOMCache.welcomeContainer.style.display = 'none';
    }, 5000);
}

function showMainPage() {
    DOMCache.loginContainer.style.display = 'none';
    DOMCache.dashboard.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    document.querySelector('header').style.display = 'block';
    DOMCache.supportBtn.style.display = 'flex';
}

function showDashboard() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }

    DOMCache.loginContainer.style.display = 'none';
    DOMCache.dashboard.style.display = 'block';
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    DOMCache.supportBtn.style.display = 'none';

    switchTab('plans');
}

function showLogin() {
    DOMCache.loginContainer.style.display = 'flex';
    DOMCache.dashboard.style.display = 'none';
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    DOMCache.supportBtn.style.display = 'none';

    DOMCache.loginForm.reset();
    DOMCache.loginError.style.display = 'none';
}

function switchTab(tabId) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remover classe active de todos os conteúdos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Adicionar classe active à aba selecionada
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Mostrar conteúdo da aba selecionada
    document.getElementById(`${tabId}Tab`).classList.add('active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================
// FUNÇÕES DO DASHBOARD
// ============================

async function addPlan() {
    const name = prompt("Nome do plano:");
    if (!name) return;

    const price = parseFloat(prompt("Preço (ex: 89.90):"));
    if (isNaN(price)) return;

    const period = prompt("Período (mensal/anual):", "mensal");
    const description = prompt("Descrição do plano:", "Plano completo para sua jornada fitness");
    const featuresInput = prompt("Benefícios (separados por vírgula):", "Acesso à academia, Aulas de musculação, Avaliação física");
    const promotion = confirm("Este plano é uma promoção?");
    const featured = confirm("Destacar este plano?");

    try {
        const newPlan = {
            name: name.trim(),
            price,
            period: period.trim().toLowerCase(),
            description: description.trim(),
            features: featuresInput ? featuresInput.split(',').map(f => f.trim()) : [],
            promotion,
            featured,
            createdAt: Date.now()
        };

        const newPlanRef = plansRef.push();
        await newPlanRef.set(newPlan);
        showSuccess('Plano criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar plano:', error);
        showError('Erro ao criar plano');
    }
}

async function editPlan(planId) {
    const plan = AppState.plans.find(p => p.id === planId);
    if (!plan) return;

    const name = prompt("Nome do plano:", plan.name);
    if (!name) return;

    const price = parseFloat(prompt("Preço:", plan.price));
    if (isNaN(price)) return;

    const period = prompt("Período (mensal/anual):", plan.period);
    const description = prompt("Descrição:", plan.description);
    const features = prompt("Benefícios (separados por vírgula):", (plan.features || []).join(', '));

    try {
        const updates = {
            name,
            price,
            period,
            description,
            features: features ? features.split(',').map(f => f.trim()) : plan.features
        };

        await plansRef.child(planId).update(updates);
        showSuccess('Plano atualizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar plano:', error);
        showError('Erro ao atualizar plano');
    }
}

async function deletePlan(planId) {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
        await plansRef.child(planId).remove();
        showSuccess('Plano excluído com sucesso!');
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
    } catch (error) {
        console.error('❌ Erro ao atualizar promoção:', error);
        showError('Erro ao atualizar promoção');
    }
}

async function deleteEmployee(employeeId) {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
        await employeesRef.child(employeeId).remove();
        showSuccess('Funcionário excluído com sucesso!');
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
    } catch (error) {
        console.error('❌ Erro ao atualizar verificação:', error);
        showError('Erro ao atualizar verificação');
    }
}

async function hideRole(role) {
    if (!confirm(`Tem certeza que deseja ocultar o cargo "${role}" na tela dos alunos?`)) return;

    try {
        const hiddenRoleRef = hiddenRolesRef.push();
        await hiddenRoleRef.set({
            role: role,
            createdAt: Date.now()
        });
        showSuccess(`Cargo "${role}" ocultado com sucesso!`);
    } catch (error) {
        console.error('❌ Erro ao ocultar cargo:', error);
        showError('Erro ao ocultar cargo');
    }
}

async function showRole(role) {
    try {
        // Encontrar e remover o cargo oculto
        const hiddenRole = AppState.hiddenRoles.find(hr => hr.role === role);
        if (hiddenRole) {
            await hiddenRolesRef.child(hiddenRole.id).remove();
            showSuccess(`Cargo "${role}" mostrado com sucesso!`);
        }
    } catch (error) {
        console.error('❌ Erro ao mostrar cargo:', error);
        showError('Erro ao mostrar cargo');
    }
}

async function deleteComment(commentId) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    try {
        await ratingsRef.child(commentId).remove();
        await loadDashboardComments();
        showSuccess('Avaliação excluída com sucesso!');
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
    } catch (error) {
        console.error('❌ Erro ao excluir candidato:', error);
        showError('Erro ao excluir candidato');
    }
}

async function contactCandidate(candidateId) {
    const candidate = AppState.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const phone = candidate.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${candidate.firstName}, vimos sua candidatura para a vaga de ${candidate.role} na Target Fit e gostaríamos de conversar com você!`);
    const url = `https://wa.me/55${phone}?text=${message}`;
    window.open(url, '_blank');
}

async function deletePreCadastro(preCadastroId) {
    if (!confirm("Tem certeza que deseja excluir este pré-cadastro?")) return;

    try {
        await preCadastrosRef.child(preCadastroId).remove();
        showSuccess('Pré-cadastro excluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao excluir pré-cadastro:', error);
        showError('Erro ao excluir pré-cadastro');
    }
}

async function addAccess() {
    const email = prompt("E-mail do novo usuário:");
    if (!email) return;

    const name = prompt("Nome do usuário:");
    if (!name) return;

    const password = prompt("Senha (mínimo 6 caracteres):");
    if (!password || password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    try {
        // Criar usuário no Firebase Auth
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);

        // Salvar informações no Realtime Database
        const userData = {
            email: email,
            name: name,
            createdAt: Date.now()
        };

        const newUserRef = usersRef.push();
        await newUserRef.set(userData);

        showSuccess('Acesso criado com sucesso!');
        console.log('Usuário criado:', userCredential.user.email);

        // Fazer logout do novo usuário (mantém o admin logado)
        await firebaseAuth.signOut();
        await firebaseAuth.signInWithEmailAndPassword('adielfhellip@gmail.com', '717928');

    } catch (error) {
        console.error('❌ Erro ao criar acesso:', error);
        showError('Erro ao criar acesso: ' + error.message);
    }
}

async function deleteAccess(userId) {
    if (!confirm("Tem certeza que deseja excluir este acesso?")) return;

    try {
        await usersRef.child(userId).remove();
        showSuccess('Acesso excluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao excluir acesso:', error);
        showError('Erro ao excluir acesso');
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

    if (DOMCache.employeesList.innerHTML) {
        renderEmployees();
    }
}

// ============================
// EVENT LISTENERS DINÂMICOS
// ============================

document.addEventListener('click', (e) => {
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
        if (!btn.id && btn.dataset.id) {
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
        const role = btn.dataset.role;

        if (action === 'editPlan') editPlan(id);
        if (action === 'deletePlan') deletePlan(id);
        if (action === 'togglePromotion') togglePlanPromotion(id);
        if (action === 'editEmployee') editEmployee(id);
        if (action === 'deleteEmployee') deleteEmployee(id);
        if (action === 'toggleVerified') toggleEmployeeVerified(id);
        if (action === 'deleteComment') deleteComment(id);
        if (action === 'deleteCandidate') deleteCandidate(id);
        if (action === 'contactCandidate') contactCandidate(id);
        if (action === 'deleteAccess') deleteAccess(id);
        if (action === 'showRole' && role) showRole(role);
        if (action === 'deletePreCadastro') deletePreCadastro(id);
        if (action === 'deletePlatformImage') deletePlatformImage(id);
        if (action === 'deleteGalleryImage') deleteGalleryImage(id);
        if (action === 'hideRole' && role) hideRole(role);
        if (action === 'deleteApp' && id) deleteApp(id);
        if (action === 'deletePartner' && id) deletePartner(id);
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
});

// ============================
// FUNÇÕES ÚTEIS
// ============================

function toggleLoading(button, textElement, loadingElement, isLoading) {
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
    DOMCache.loginError.textContent = message;
    DOMCache.loginError.style.display = 'block';
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
    }
}

// ============================
// INICIALIZAR APLICAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', initializeApp);
