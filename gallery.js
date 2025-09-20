const BASE_DOMAIN = "api2.hackclub.com";

let submissionStatus = "All";
const urlParams = new URLSearchParams(window.location.search);
const statusQuery = urlParams.get("status");
let eventCode = urlParams.get("eventCode") || "";
let currentPage = parseInt(urlParams.get("page")) || 1;
const itemsPerPage = 12;
let allSubmissions = [];

document.getElementById("event-input").value = eventCode

if (["All", "Approved", "Pending", "Rejected"].includes(statusQuery)) {
  submissionStatus = statusQuery;
}

document
  .getElementById(`status-${submissionStatus.toLowerCase()}`)
  .classList.add("active");

fetchData();

async function fetchData() {
  const params = new URLSearchParams();
  let filterFormula = "AND(";
  if (submissionStatus !== "All") {
    filterFormula += `{Status} = '${submissionStatus}'`;
  }
  if (eventCode !== "") {
    if (submissionStatus !== "All") {
      filterFormula += ",";
    }
    filterFormula += `{Event Code} = '${eventCode}'`;
  }

  filterFormula += ")";

  params.append(
    "select",
    JSON.stringify({ filterByFormula: filterFormula })
  );
  params.append("cache", true);
  
  try {
    const response = await fetch(
      `https://${BASE_DOMAIN}/v0.1/Boba Drops/Websites?${params}`
    );
    const submissions = await response.json();
    console.log(submissions);
    allSubmissions = submissions;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    allSubmissions = [];
  }
  
  displayPage(currentPage);
}

function displayPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageSubmissions = allSubmissions.slice(startIndex, endIndex);

  let submissionsPush = "";
  pageSubmissions.forEach((submission) => {
    let photoUrl = "";
    if (
      !submission.fields.Screenshot ||
      submission.fields.Screenshot.length === 0
    ) {
      photoUrl = "https://hc-cdn.hel1.your-objectstorage.com/s/v3/ee0109f20430335ebb5cd3297a973ce244ed01cf_depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg";
    } else {
      photoUrl = submission.fields.Screenshot[0].url;
    }
    submissionsPush += `
      <div class="grid-submission">
        <div class="submission-photo"
          style="background-image: url(${photoUrl});">
        </div>
        <span class="status ${submission.fields.Status.toLowerCase()}"></span>
        <div class="links">
          <a href="${
            submission.fields["Code URL"]
          }" class="github-button"><i class="fa-brands fa-github"></i> Github</a>
          <a href="${
            submission.fields["Playable URL"]
          }" class="demo-button"><i class="fa-solid fa-link"></i> Demo</a>
        </div>
      </div>
    `;
  });

  if (allSubmissions.length === 0) {
    document.getElementById("submissions-content").innerHTML =
      "<h1 style='text-align: center;'>No submissions found</h1>";
    document.getElementById("pagination-controls").style.display = "none";
  } else {
    document.getElementById("grid-gallery").innerHTML = submissionsPush;
    setupPagination();
  }
}

function setupPagination() {
  const totalPages = Math.ceil(allSubmissions.length / itemsPerPage);
  
  if (totalPages <= 1) {
    document.getElementById("pagination-controls").style.display = "none";
    return;
  }

  document.getElementById("pagination-controls").style.display = "flex";
  
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const pageNumbers = document.getElementById("page-numbers");
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateURL();
      displayPage(currentPage);
    }
  };
  
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateURL();
      displayPage(currentPage);
    }
  };
  
  pageNumbers.innerHTML = "";
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = "page-number";
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.onclick = () => {
      currentPage = i;
      updateURL();
      displayPage(currentPage);
    };
    pageNumbers.appendChild(pageBtn);
  }
}

function updateURL() {
  const params = new URLSearchParams();
  if (submissionStatus !== "All") {
    params.set("status", submissionStatus);
  }
  if (eventCode !== "") {
    params.set("eventCode", eventCode);
  }
  if (currentPage > 1) {
    params.set("page", currentPage);
  }
  
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newURL);
}

const form = document.getElementById("event-code-search");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const eventCode = document.getElementById("event-input").value.trim();
  currentPage = 1;
  window.location.href = `?eventCode=${eventCode}&status=${submissionStatus}`;
});
