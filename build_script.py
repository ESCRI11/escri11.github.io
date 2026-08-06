import yaml
import json
import re
from datetime import date

# --- design constants (see site-refresh/design-directives.md) -----------------
# Coordinates of the location named in content.yaml; the hero globe pings the
# same point. Presentation detail, not content — the yaml text is shown verbatim
# next to it.
COORDINATES = "46.01°N 8.96°E"
# Words in the tagline lifted into the Newsreader italic accent face.
ACCENT_PHRASE = "technological side"
# Author name lifted from --ink-2 to --ink-1 in publication rows.
ME = "Escriba-Montagut, X."


def parse_description(description):
    def replace_link(match):
        text = match.group(1)
        url = match.group(2)
        return f'<a href="{url}" target="_blank" rel="noopener">{text}</a>'
    return re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', replace_link, description)


def generate_js():
    with open('content.yaml', 'r') as yaml_file:
        content = yaml.safe_load(yaml_file)

    # Parse descriptions in education
    for edu in content['education']:
        edu['description'] = parse_description(edu['description'])

    # Newest first — the publication list reads as a dataset (directives §7).
    aw = content['academic_work']
    aw['papers'].sort(key=lambda p: -int(p['year']))
    aw['posters'].sort(key=lambda p: -int(p['year']))
    aw['public_talks'].sort(key=lambda t: -int(t['date']))
    aw['workshops'].sort(key=lambda w: -int(w['date']))

    # Section count badges, computed from the yaml at build time.
    counts = {
        'education': f"{len(content['education'])} entries",
        'work': f"{len(content['work_experience'])} positions",
        'academia': (f"{len(aw['papers'])} papers · {len(aw['posters'])} posters"
                     f" · {len(aw['public_talks'])} talks"
                     f" · {len(aw['workshops'])} workshops"),
        'papers': str(len(aw['papers'])),
        'posters': str(len(aw['posters'])),
        'public_talks': str(len(aw['public_talks'])),
        'workshops': str(len(aw['workshops'])),
    }

    build_line = f"last build: {date.today().isoformat()} · hand-prompted, no frameworks"

    js_content = f"""const content = {json.dumps(content, indent=2)};
const counts = {json.dumps(counts, indent=2)};
const COORDINATES = {json.dumps(COORDINATES)};
const ACCENT_PHRASE = {json.dumps(ACCENT_PHRASE)};
const ME = {json.dumps(ME)};
const BUILD_LINE = {json.dumps(build_line)};

// Lift the author's own name out of the --ink-2 author list so he's findable.
function highlightMe(authors) {{
    return authors.split(ME).join(`<span class="me">${{ME}}</span>`);
}}

// Newsreader-italic accent words inside the mono tagline.
function accentTagline(tagline) {{
    return tagline.split(ACCENT_PHRASE).join(`<em>${{ACCENT_PHRASE}}</em>`);
}}

// Real DOIs link out; editorial statuses ("Under revision") render as text.
function doiMarkup(doi) {{
    if (/^10\\./.test(doi)) {{
        return `<a class="doi" href="https://doi.org/${{doi}}" target="_blank" rel="noopener">doi:${{doi}}</a>`;
    }}
    return `<span class="doi status">${{doi}}</span>`;
}}

// NN / SECTION index label, with an optional right-aligned count badge.
function setSectionLabel(el, index, title, count) {{
    if (!el) return;
    el.className = 'sec-label';
    el.innerHTML =
        `<span class="idx">${{index}}</span><span class="sl">/</span><span class="txt">${{title}}</span>` +
        (count ? `<span class="count">${{count}}</span>` : '');
}}

// Meta tags whose text lives in content.yaml, set the same way document.title
// is. NOTE: crawlers that do not run JS see only the static og:image/card tags.
function setMeta(key, value, attr) {{
    let el = document.querySelector(`meta[${{attr}}="${{key}}"]`);
    if (!el) {{
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }}
    el.setAttribute('content', value);
}}

function makeRows() {{
    const wrap = document.createElement('div');
    wrap.className = 'rows';
    return wrap;
}}

function addRow(wrap, year, body) {{
    const row = document.createElement('div');
    row.className = 'row reveal';
    row.innerHTML = `<div class="yr">${{year}}</div><div>${{body}}</div>`;
    wrap.appendChild(row);
}}

function setupMobileMenu() {{
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('header nav');

    if (menuToggle && nav) {{
        menuToggle.addEventListener('click', (e) => {{
            e.stopPropagation(); // Prevent click from immediately bubbling to document
            const open = nav.classList.toggle('show');
            menuToggle.classList.toggle('active', open);
            menuToggle.setAttribute('aria-expanded', String(open));
        }});
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {{
            if (nav.classList.contains('show') &&
                !nav.contains(e.target) &&
                !menuToggle.contains(e.target)) {{
                nav.classList.remove('show');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }}
        }});

        // Close on Escape, so the menu is escapable from the keyboard
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'Escape' && nav.classList.contains('show')) {{
                nav.classList.remove('show');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }}
        }});

        // Prevent clicks inside nav from closing the menu
        nav.addEventListener('click', (e) => {{
            e.stopPropagation();
        }});
    }}
}}

function populateCommonElements() {{
    document.title = `${{content.name}}`;
    document.getElementById('page-title').textContent = `${{content.name}}`;
    document.getElementById('footer-name').textContent = content.name;

    const brand = document.getElementById('header-name');
    if (brand) brand.textContent = content.name;

    const buildLine = document.getElementById('build-line');
    if (buildLine) buildLine.textContent = BUILD_LINE;

    setMeta('description', content.tagline, 'name');
    setMeta('og:title', content.name, 'property');
    setMeta('og:description', content.tagline, 'property');

    // Generate navigation
    const path = window.location.pathname;
    const current = path.endsWith('/') ? 'index.html' : path.split('/').pop();
    const nav = document.querySelector('header nav ul');
    content.navigation.forEach(item => {{
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;
        if (item.url === current) {{
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
        }}
        li.appendChild(a);
        nav.appendChild(li);
    }});
    setupMobileMenu();
}}

function populateHome() {{
    populateCommonElements();
    document.getElementById('name').textContent = content.name;
    document.getElementById('tagline').innerHTML =
        accentTagline(content.tagline) + '<span class="cursor" aria-hidden="true"></span>';
    document.getElementById('location').innerHTML =
        `<span class="c">${{COORDINATES}}</span> &mdash; ${{content.location}}`;
    document.getElementById('about').textContent = content.about;
    setSectionLabel(document.getElementById('about-label'), '00', 'ABOUT');

    const socialLinksContainer = document.getElementById('social-links');
    if (socialLinksContainer) {{
        content.social_links.forEach(link => {{
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerHTML =
                `<span class="br" aria-hidden="true">[</span>` +
                `<span class="lbl">${{link.name}}</span>` +
                `<span class="br" aria-hidden="true">]</span>`;
            socialLinksContainer.appendChild(a);
        }});
    }}
}}

function populateEducation() {{
    populateCommonElements();
    setSectionLabel(document.getElementById('page-index'), '01', 'EDUCATION', counts.education);
    const educationContainer = document.getElementById('education-container');
    if (educationContainer) {{
        content.education.forEach(edu => {{
            const eduElement = document.createElement('article');
            eduElement.className = 'panel reveal';
            eduElement.innerHTML = `
                <span class="tick l" aria-hidden="true">+</span><span class="tick r" aria-hidden="true">+</span>
                <div class="p-head">
                    <div class="p-main">
                        <h2>${{edu['degree']}}</h2>
                        <p class="org">${{edu['institution']}}</p>
                    </div>
                    <div class="p-meta">
                        <span class="dates">${{edu['dates']}}</span>
                        <span class="location">${{edu['location']}}</span>
                    </div>
                </div>
                <p class="grade">${{edu['grade']}}</p>
                <p class="p-body">${{edu['description']}}</p>
            `;
            educationContainer.appendChild(eduElement);
        }});
    }}
}}

function setupSectionNavHighlight() {{
    const sections = document.querySelectorAll('#academic-work-container section');
    const navLinks = document.querySelectorAll('.section-nav a');

    const observer = new IntersectionObserver((entries) => {{
        entries.forEach(entry => {{
            if (entry.isIntersecting) {{
                navLinks.forEach(link => link.classList.remove('active'));
                const id = entry.target.id;
                const activeLink = document.querySelector(`.section-nav a[href="#${{id}}"]`);
                if (activeLink) activeLink.classList.add('active');
            }}
        }});
    }}, {{
        rootMargin: '-20% 0px -60% 0px'
    }});

    sections.forEach(section => observer.observe(section));
}}

function populateAcademicWork() {{
    populateCommonElements();
    setSectionLabel(document.getElementById('page-index'), '02', 'ACADEMIA', counts.academia);
    const academicWorkContainer = document.getElementById('academic-work-container');
    if (academicWorkContainer) {{
        // Papers — a dataset, not cards: year · title · authors · journal · doi
        const papersSection = createSection('Papers', counts.papers);
        const papersRows = makeRows();
        content.academic_work.papers.forEach(paper => {{
            addRow(papersRows, paper.year,
                `<div class="ttl">${{paper.title}}</div>` +
                `<div class="au">${{highlightMe(paper.authors)}}</div>` +
                `<div class="src"><span class="jr">${{paper.journal}}</span> · ${{doiMarkup(paper.doi)}}</div>`);
        }});
        papersSection.appendChild(papersRows);
        academicWorkContainer.appendChild(papersSection);

        // Posters
        const postersSection = createSection('Posters', counts.posters);
        const postersRows = makeRows();
        content.academic_work.posters.forEach(poster => {{
            addRow(postersRows, poster.year,
                `<div class="ttl">${{poster.title}}</div>` +
                `<div class="au">${{poster.conference}}</div>` +
                `<div class="src"><span class="jr">${{poster.location}}</span></div>`);
        }});
        postersSection.appendChild(postersRows);
        academicWorkContainer.appendChild(postersSection);

        // Public Talks
        const talksSection = createSection('Public Talks', counts.public_talks);
        const talksRows = makeRows();
        content.academic_work.public_talks.forEach(talk => {{
            addRow(talksRows, talk.date,
                `<div class="ttl">${{talk.title}}</div>` +
                `<div class="au">${{talk.event}}</div>` +
                `<div class="src"><span class="jr">${{talk.location}}</span></div>`);
        }});
        talksSection.appendChild(talksRows);
        academicWorkContainer.appendChild(talksSection);

        // Workshops
        const workshopsSection = createSection('Workshops', counts.workshops);
        const workshopsRows = makeRows();
        content.academic_work.workshops.forEach(workshop => {{
            addRow(workshopsRows, workshop.date,
                `<div class="ttl">${{workshop.title}}</div>` +
                `<div class="au">${{workshop.organization}}</div>` +
                `<div class="src"><span class="jr">${{workshop.location}}</span></div>`);
        }});
        workshopsSection.appendChild(workshopsRows);
        academicWorkContainer.appendChild(workshopsSection);

        setupSectionNavHighlight();
    }}
}}

function populateWorkExperience() {{
    populateCommonElements();
    setSectionLabel(document.getElementById('page-index'), '03', 'WORK EXPERIENCE', counts.work);
    const workExperienceContainer = document.getElementById('work-experience-container');
    if (workExperienceContainer) {{
        content.work_experience.forEach(job => {{
            const jobElement = document.createElement('article');
            jobElement.className = 'panel reveal';
            jobElement.innerHTML = `
                <span class="tick l" aria-hidden="true">+</span><span class="tick r" aria-hidden="true">+</span>
                <div class="p-head">
                    <div class="p-main">
                        <h2>${{job['title']}}</h2>
                        <p class="org">${{job['company']}}</p>
                    </div>
                    <div class="p-meta">
                        <span class="dates">${{job['dates']}}</span>
                        <span class="location">${{job['location']}}</span>
                    </div>
                </div>
                <ul class="x">
                    ${{job['responsibilities'].map(resp => `<li>${{resp}}</li>`).join('')}}
                </ul>
            `;
            workExperienceContainer.appendChild(jobElement);
        }});
    }}
}}

function createSection(title, count) {{
    const section = document.createElement('section');
    section.id = title.toLowerCase().replace(/ +/g, '-');
    section.innerHTML =
        `<h2 class="sub-label"><span class="txt">${{title}}</span>` +
        (count ? `<span class="count">${{count}}</span>` : '') + `</h2>`;
    return section;
}}

// Determine which function to run based on the page
if (document.body.id === 'home-page') {{
    populateHome();
}} else if (document.body.id === 'education-page') {{
    populateEducation();
}} else if (document.body.id === 'academic-work-page') {{
    populateAcademicWork();
}} else if (document.body.id === 'work-experience-page') {{
    populateWorkExperience();
}}

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();
"""

    with open('script.js', 'w') as js_file:
        js_file.write(js_content)


if __name__ == "__main__":
    generate_js()
    print("script.js has been generated successfully.")
