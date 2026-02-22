
// ---------- 1) HTML include 로더 ----------
async function includeHTML() {
  const includes = document.querySelectorAll('[data-include]');
  for (const el of includes) {
    const url = el.getAttribute('data-include');
    try {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(resp.status);
      const html = await resp.text();
      el.outerHTML = html;
    } catch (e) {
      console.error('❌ include 실패:', url, e);
    }
  }
}



// ---------- 2) 필터 함수 ----------
function applyFilter(filter) {
  const items = document.querySelectorAll(".item");

  items.forEach(item => {
    const category = item.getAttribute("data-category");

    if (filter === "all" || category?.includes(filter)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  document.querySelectorAll("[data-filter]").forEach(link => {
    link.classList.toggle("is-active", link.getAttribute("data-filter") === filter);
  });
}



// ---------- 3) DOM 로드 시작 ----------
document.addEventListener('DOMContentLoaded', async () => {

  // ① partial HTML 먼저 불러오기
  await includeHTML();

  const body = document.body;



  // ===============================
  // ⭐ 페이지 진입 Fade In
  // ===============================
  requestAnimationFrame(() => {
    body.classList.add("page-loaded");
  });



  // ===============================
  // 메뉴 제어
  // ===============================

  const expandCheckbox = document.getElementById('expand-menu');
  const foldingWrap    = document.querySelector('.menu-folding');
  const unfoldingWrap  = document.querySelector('.menu-unfolding');
  const menuListMobile = foldingWrap?.querySelector('ul');
  const menuListDesk   = unfoldingWrap?.querySelector('ul');

  const closeMenu = () => {
    if (expandCheckbox && expandCheckbox.checked) {
      expandCheckbox.checked = false;
      body.classList.remove('nav-open');
    }
  };

  if (expandCheckbox) {
    expandCheckbox.addEventListener('change', () => {
      body.classList.toggle('nav-open', expandCheckbox.checked);
    });
  }

  document.addEventListener('click', (e) => {
    if (!expandCheckbox || !expandCheckbox.checked) return;
    const menuArea = foldingWrap || document.body;
    if (!menuArea.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const BREAKPOINT = 1100;
  const onResize = () => {
    if (window.innerWidth > BREAKPOINT) closeMenu();
  };
  window.addEventListener('resize', onResize);
  onResize();



  // ===============================
  // 현재 페이지 활성 표시
  // ===============================

  const markActiveLinks = (scope) => {
    if (!scope) return;
    const here = location.pathname.replace(/\/+$/, '');
    scope.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      try {
        const url = new URL(href, location.origin);
        const path = url.pathname.replace(/\/+$/, '');
        if (path === here) a.classList.add('is-active');
      } catch (_) {}
    });
  };

  markActiveLinks(menuListMobile);
  markActiveLinks(menuListDesk);



  // ===============================
  // URL 파라미터 필터 적용
  // ===============================

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (category) {
    applyFilter(category);
  } else {
    applyFilter("all");
  }



// ===============================
// 로딩 애니메이션 효과 (개선)
// - 모든 이미지 기다리지 않고 "각 item 단위"로 표시
// ===============================
const items = document.querySelectorAll(".item");
const images = document.querySelectorAll(".item img");

let index = 0;

images.forEach(img => {
  const item = img.closest(".item");
  if (!item) return;

  const reveal = () => {
    // display:none(필터로 숨긴 것) 제외
    if (item.style.display === "none") return;

    const delay = index * 40; // 80 → 40 정도로 줄이면 더 민첩
    index++;

    setTimeout(() => item.classList.add("loaded"), delay);
  };

  if (img.complete) {
    reveal();
  } else {
    img.addEventListener("load", reveal, { once: true });
    img.addEventListener("error", reveal, { once: true }); // 깨진 이미지도 멈추지 않게
  }
});

// ✅ 이미지가 없는 item도 즉시 표시(있을 수 있으면)
items.forEach(item => {
  const hasImg = item.querySelector("img");
  if (!hasImg) item.classList.add("loaded");
});




  // ===============================
  // 필터 클릭 이벤트
  // ===============================

  document.addEventListener("click", function (e) {
    const filter = e.target.getAttribute("data-filter");
    if (!filter) return;

    e.preventDefault();
    applyFilter(filter);
    history.pushState(null, "", `?category=${filter}`);
  });



  // ===============================
  // 뒤로가기(popstate)
  // ===============================

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "all";
    applyFilter(category);
  });



  // ===============================
  // ⭐ 페이지 이동 Fade Out
  // ===============================

  document.addEventListener("click", function (e) {

    const link = e.target.closest("a");
    if (!link) return;

    const url = link.getAttribute("href");
    if (!url) return;

    // 필터용 URL은 제외
    if (url.startsWith("?")) return;

    // 외부링크 제외
    if (url.startsWith("http") || url.startsWith("mailto") || url.startsWith("#")) return;

    e.preventDefault();

    body.classList.remove("page-loaded");

    setTimeout(() => {
      window.location.href = url;
    }, 400);
  });





  // ===============================
  // shop 페이지 외부 구매 링크 새탭
  // ===============================

  if (body.classList.contains('shop-page')) {
    document.querySelectorAll('a.buy').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

});
