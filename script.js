// رابط Google Apps Script الخاص بك
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFCdjtTgKSaZV5Fw0yJcLsMQ0xdiPXcM2KhDkdMIsztr3g6pep3XWyyp-oGv0hideb/exec";

// تخزين المهارة المحددة حالياً
let currentSkill = "";

// قاعدة بيانات محلية للأنشطة المخزنة
let activitiesData = JSON.parse(localStorage.getItem('english_portal_activities')) || {
    listening: [
        { title: "Listening Exercise 1 - Greetings", link: "#" }
    ],
    speaking: [
        { title: "Speaking Challenge 1 - Self Introduction", link: "#" }
    ],
    reading: [
        { title: "Reading Short Stories", link: "#" }
    ],
    writing: [
        { title: "Grammar & Spelling Test", link: "#" }
    ]
};

// عند تحميل الصفحة تحقق مما إذا كان الطالب مسجلاً مسبقاً
document.addEventListener("DOMContentLoaded", () => {
    const savedStudent = localStorage.getItem("student_id");
    if (savedStudent) {
        showDashboardView(savedStudent);
    }
});

// دالة تسجيل الدخول والتحقق من الرقم عبر Google Apps Script
async function loginStudent() {
    const inputVal = document.getElementById("studentIdInput").value.trim();
    const errorEl = document.getElementById("loginError");
    const loaderEl = document.getElementById("loginLoader");

    if (!inputVal) {
        errorEl.textContent = "يرجى إدخال الرقم التعريفي.";
        errorEl.style.display = "block";
        return;
    }

    errorEl.style.display = "none";
    loaderEl.style.display = "block";

    try {
        // جلب البيانات من شيت Google
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        // استخراج القيم من العمود الأول (Column A)
        let validIds = [];

        if (Array.isArray(data)) {
            validIds = data.map(row => Array.isArray(row) ? String(row[0]).trim() : String(row).trim());
        } else if (data.data && Array.isArray(data.data)) {
            validIds = data.data.map(row => Array.isArray(row) ? String(row[0]).trim() : String(row).trim());
        }

        // التحقق من وجود الرقم المدخل في العمود A
        const isValid = validIds.some(id => id === inputVal);

        if (isValid) {
            localStorage.setItem("student_id", inputVal);
            showDashboardView(inputVal);
        } else {
            errorEl.textContent = "الرقم التعريفي غير موجود بالعمود (A). يرجى التأكد وإعادة المحاولة.";
            errorEl.style.display = "block";
        }
    } catch (err) {
        console.error("Error fetching data:", err);
        errorEl.textContent = "حدث خطأ أثناء الاتصال بالسيرفر. يرجى المحاولة لاحقاً.";
        errorEl.style.display = "block";
    } finally {
        loaderEl.style.display = "none";
    }
}

// عرض لوحة التحكم الخاصة بالطالب
function showDashboardView(studentId) {
    document.getElementById("loginCard").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("activitiesSection").style.display = "none";
    
    const userBadge = document.getElementById("userBadge");
    const userNameText = document.getElementById("userNameText");
    const welcomeText = document.getElementById("welcomeText");

    userNameText.textContent = `طالب رقم: ${studentId}`;
    welcomeText.textContent = `مرحباً بك يا طالب (${studentId})!`;
    userBadge.style.display = "flex";
}

// العودة للوحة المهارات
function showDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("activitiesSection").style.display = "none";
}

// فتح مهارة معينة وعرض الأنشطة
function openSkill(skillName) {
    currentSkill = skillName;
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("activitiesSection").style.display = "block";

    const titles = {
        listening: "أنشطة الاستماع (Listening Activities)",
        speaking: "أنشطة المحادثة (Speaking Activities)",
        reading: "أنشطة القراءة (Reading Activities)",
        writing: "أنشطة الكتابة (Writing Activities)"
    };

    document.getElementById("selectedSkillTitle").textContent = titles[skillName] || "الأنشطة";
    renderActivities();
}

// عرض الأنشطة الخاصة بالمهارة الحالية
function renderActivities() {
    const listContainer = document.getElementById("activitiesList");
    listContainer.innerHTML = "";

    const currentActivities = activitiesData[currentSkill] || [];

    if (currentActivities.length === 0) {
        listContainer.innerHTML = "<p style='color:#6b7280;'>لا توجد أنشطة مضافة لهذه المهارة حتى الآن.</p>";
        return;
    }

    currentActivities.forEach((act) => {
        const item = document.createElement("div");
        item.className = "activity-item";
        item.innerHTML = `
            <div>
                <strong>${act.title}</strong>
            </div>
            <a href="${act.link}" target="_blank" class="activity-btn">
                بدء النشاط <i class="fa-solid fa-external-link-alt"></i>
            </a>
        `;
        listContainer.appendChild(item);
    });
}

// إضافة نشاط جديد إلى المهارة الحالية
function addNewActivity() {
    const titleInput = document.getElementById("newActivityTitle");
    const linkInput = document.getElementById("newActivityLink");

    const title = titleInput.value.trim();
    const link = linkInput.value.trim();

    if (!title || !link) {
        alert("يرجى إدخال عنوان النشاط والرابط الخاص به.");
        return;
    }

    if (!activitiesData[currentSkill]) {
        activitiesData[currentSkill] = [];
    }

    activitiesData[currentSkill].push({ title, link });
    
    // حفظ التحديثات في المتصفح
    localStorage.setItem('english_portal_activities', JSON.stringify(activitiesData));

    titleInput.value = "";
    linkInput.value = "";

    renderActivities();
    alert("تمت إضافة النشاط بنجاح!");
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem("student_id");
    document.getElementById("userBadge").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("activitiesSection").style.display = "none";
    document.getElementById("loginCard").style.display = "block";
    document.getElementById("studentIdInput").value = "";
}
