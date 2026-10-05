const links = [
  { name: "Autumn coaching sessions", code: "1", url: "https://train.skillerwhale.com/coaching_sessions/autumn-2026", clicks: 12840, status: "Active", createdDaysAgo: 12, trend: [4, 7, 5, 9, 11, 8, 13] },
  { name: "Python skills assessment", code: "2", url: "https://train.skillerwhale.com/assessments/python?source=email", clicks: 9204, status: "Active", createdDaysAgo: 28, trend: [4, 6, 8, 6, 10, 12, 14] },
  { name: "October workshop calendar", code: "3", url: "https://train.skillerwhale.com/workshops/october?teams=alpha,beta", clicks: 7841, status: "Active", createdDaysAgo: 3, trend: [3, 8, 6, 10, 9, 12, 15] },
  { name: "GenAI learning pathways", code: "4", url: "https://train.skillerwhale.com/learning-pathways/generative-ai", clicks: 6135, status: "Active", createdDaysAgo: 44, trend: [5, 7, 5, 8, 7, 8, 9] },
  { name: "Team onboarding guide", code: "5", url: "https://train.skillerwhale.com/onboarding/team-guide", clicks: 4521, status: "Active", createdDaysAgo: 66, trend: [7, 8, 6, 7, 6, 5, 6] },
  { name: "Engineering newsletter", code: "6", url: "https://train.skillerwhale.com/newsletters/engineering", clicks: 3108, status: "Active", createdDaysAgo: 37, trend: [2, 3, 5, 3, 6, 7, 8] },
  { name: "Summer event recap", code: "7", url: "https://train.skillerwhale.com/events/summer-recap", clicks: 2260, status: "Paused", createdDaysAgo: 91, trend: [11, 9, 8, 5, 4, 3, 2] },
  { name: "Partner resource hub", code: "8", url: "https://train.skillerwhale.com/partners/resources", clicks: 1745, status: "Active", createdDaysAgo: 19, trend: [2, 3, 3, 5, 4, 6, 7] }
];

const insights = [
  ["Email accounts for the largest share of clicks.", "Check whether workshop reminder emails explain the increase before using this in the weekly report."],
  ["The October calendar link has recent traffic.", "Compare its clicks with the workshop schedule before reporting on the campaign."],
  ["A paused link is still listed in the report.", "Confirm whether the summer event recap should remain available to staff."]
];

const number = new Intl.NumberFormat("en-GB");
const state = { days: 30, search: "", sort: "clicks", insight: 0 };
const dailyClicks = Array.from({ length: 90 }, (_, day) =>
  Math.round(175 + day * 2.1 + Math.sin(day * 0.58) * 54 + Math.cos(day * 0.17) * 29 + (day % 11 === 0 ? 85 : 0))
);

function periodClicks(link) {
  const factors = { 7: 0.085, 30: 0.36, 90: 1 };
  return Math.round(link.clicks * factors[state.days]);
}

function formatDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function renderChart(values) {
  const ceiling = Math.ceil(Math.max(...values) / 100) * 100;
  const coordinates = values.map((value, index) => {
    const x = index * 680 / (values.length - 1);
    const y = 212 - value / ceiling * 194;
    return [x.toFixed(1), y.toFixed(1)];
  });
  const line = coordinates.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  document.querySelector("#chart-line").setAttribute("d", line);
  document.querySelector("#chart-area").setAttribute("d", `${line} L680 212 L0 212 Z`);
  document.querySelector("#axis-top").textContent = number.format(ceiling);
  document.querySelector("#axis-middle").textContent = number.format(ceiling / 2);
  document.querySelector("#axis-start").textContent = formatDate(state.days - 1);
  document.querySelector("#axis-mid").textContent = formatDate(Math.floor(state.days / 2));
}

function sparkline(points) {
  const path = points.map((value, index) => `${index ? "L" : "M"}${index * 11} ${20 - value}`).join(" ");
  return `<svg class="sparkline" viewBox="0 0 70 20" aria-hidden="true"><path d="${path}" fill="none" stroke="#8d72f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function visibleLinks() {
  const query = state.search.toLowerCase();
  const shown = links.filter(link => `${link.name} ${link.url} ${link.code}`.toLowerCase().includes(query));
  if (state.sort === "recent") shown.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
  if (state.sort === "name") shown.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "clicks") shown.sort((a, b) => periodClicks(b) - periodClicks(a));
  return shown;
}

function renderLinks() {
  const shown = visibleLinks();
  document.querySelector("#links-body").innerHTML = shown.length ? shown.map(link => `
    <tr>
      <td><div class="link-title"><span class="link-icon">↗</span><span><strong>${link.name}</strong><small>${link.url.replace("https://", "")}</small></span></div></td>
      <td><span class="short-link">short.skillerwhale.com/${link.code}</span></td>
      <td><span class="status ${link.status.toLowerCase()}"><i></i>${link.status}</span></td>
      <td class="click-count">${number.format(periodClicks(link))}</td>
      <td>${sparkline(link.trend)}</td>
      <td><button class="copy-button" type="button" data-copy="${link.code}" aria-label="Copy ${link.name} short URL">Copy</button></td>
    </tr>`).join("") : `<tr><td class="empty-table" colspan="6">No links found. Try a different search.</td></tr>`;
  document.querySelector("#table-count").textContent = `Showing ${shown.length} of ${links.length} links`;
}

function render() {
  const values = dailyClicks.slice(-state.days);
  const total = values.reduce((sum, value) => sum + value, 0);
  document.querySelector("#clicks-value").textContent = number.format(total);
  document.querySelector("#visitors-value").textContent = number.format(Math.round(total * 0.74));
  document.querySelector("#rate-value").textContent = `${(total / (total * 2.37) * 100).toFixed(1)}%`;
  document.querySelector("#active-value").textContent = links.filter(link => link.status === "Active").length;
  document.querySelector("#chart-total").textContent = number.format(total);
  document.querySelector("#donut-total").textContent = number.format(total);
  renderChart(values);
  renderLinks();
}

let toastTimeout;
function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => element.classList.remove("visible"), 2600);
}

document.querySelectorAll("[data-range]").forEach(button => button.addEventListener("click", () => {
  state.days = Number(button.dataset.range);
  document.querySelectorAll("[data-range]").forEach(other => other.classList.toggle("selected", other === button));
  render();
}));

document.querySelector("#link-search").addEventListener("input", event => {
  state.search = event.target.value.trim();
  renderLinks();
});

document.querySelector("#link-sort").addEventListener("change", event => {
  state.sort = event.target.value;
  renderLinks();
});

document.querySelector("#links-body").addEventListener("click", event => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  navigator.clipboard.writeText(`https://short.skillerwhale.com/${button.dataset.copy}`)
    .then(() => toast("Short URL copied"))
    .catch(() => toast("Couldn't copy the link"));
});

document.querySelector("#export-button").addEventListener("click", () => {
  const rows = [["Name", "Short URL", "Destination", "Status", "Clicks"]];
  visibleLinks().forEach(link => rows.push([link.name, `https://short.skillerwhale.com/${link.code}`, link.url, link.status, periodClicks(link)]));
  const file = new Blob([rows.map(row => row.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `short-link-report-${state.days}d.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("CSV downloaded");
});

document.querySelector("#insight-button").addEventListener("click", () => {
  state.insight = (state.insight + 1) % insights.length;
  document.querySelector("#insight-title").textContent = insights[state.insight][0];
  document.querySelector("#insight-copy").textContent = insights[state.insight][1];
});

render();
