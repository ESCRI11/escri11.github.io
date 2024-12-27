import yaml
import json
import re

def parse_description(description):
    def replace_link(match):
        text = match.group(1)
        url = match.group(2)
        return f'<a href="{url}" target="_blank">{text}</a>'
    return re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', replace_link, description)

def generate_js():
    with open('content.yaml', 'r') as yaml_file:
        content = yaml.safe_load(yaml_file)
    # Parse descriptions in education
    for edu in content['education']:
        edu['description'] = parse_description(edu['description'])
    js_content = f"""const content = {json.dumps(content, indent=2)};

function setupMobileMenu() {{
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {{
        menuToggle.addEventListener('click', (e) => {{
            e.stopPropagation(); // Prevent click from immediately bubbling to document
            nav.classList.toggle('show');
            menuToggle.classList.toggle('active');
        }});
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {{
            // Check if menu is open and click is outside nav and menu toggle
            if (nav.classList.contains('show') &&
                !nav.contains(e.target) &&
                !menuToggle.contains(e.target)) {{
                nav.classList.remove('show');
                menuToggle.classList.remove('active');
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

    // Generate navigation
    const nav = document.querySelector('nav ul');
    content.navigation.forEach(item => {{
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;
        if (window.location.pathname.endsWith(item.url)) {{
            a.classList.add('active');
        }}
        li.appendChild(a);
        nav.appendChild(li);
    }});
    setupMobileMenu();
}}

function populateHome() {{
    populateCommonElements();
    document.getElementById('name').textContent = content.name;
    document.getElementById('tagline').textContent = content.tagline;
    document.getElementById('location').innerHTML = `
      <span style="display: flex; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span style="color: white;">${{content.location}}</span>
      </span>
    `;
    document.getElementById('about').textContent = content.about;

    const profileImage = document.getElementById('profile-image');
    if (profileImage) {{
        profileImage.src = content.image;
        profileImage.alt = content.name;
    }}

    const socialLinksContainer = document.getElementById('social-links');
    if (socialLinksContainer) {{
        content.social_links.forEach(link => {{
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.target = '_blank';
            socialLinksContainer.appendChild(a);
        }});
    }}
}}

function populateEducation() {{
    populateCommonElements();
    const educationContainer = document.getElementById('education-container');
    if (educationContainer) {{
        content.education.forEach(edu => {{
            const eduElement = document.createElement('div');
            eduElement.className = 'education-item';
            eduElement.innerHTML = `
                <h2>${{edu.degree}}</h2>
                <h3>${{edu.institution}}</h3>
                <p>${{edu.location}}</p>
                <p>${{edu.dates}}</p>
                <p>${{edu.grade}}</p>
                <p>${{edu.description}}</p>
            `;
            educationContainer.appendChild(eduElement);
        }});
    }}
}}

function populateAcademicWork() {{
    populateCommonElements();
    const academicWorkContainer = document.getElementById('academic-work-container');
    if (academicWorkContainer) {{
        // Papers
        const papersSection = createSection('Papers');
        content.academic_work.papers.forEach(paper => {{
            const paperElement = document.createElement('div');
            paperElement.className = 'academic-item';
            paperElement.innerHTML = `
                <h3>${{paper.title}}</h3>
                <p>${{paper.authors}}</p>
                <p>${{paper.journal}}, ${{paper.year}}</p>
                <p>DOI: <a href="https://doi.org/${{paper.doi}}" target="_blank">${{paper.doi}}</a></p>
            `;
            papersSection.appendChild(paperElement);
        }});
        academicWorkContainer.appendChild(papersSection);

        // Posters
        const postersSection = createSection('Posters');
        content.academic_work.posters.forEach(poster => {{
            const posterElement = document.createElement('div');
            posterElement.className = 'academic-item';
            posterElement.innerHTML = `
                <h3>${{poster.title}}</h3>
                <p>${{poster.conference}}</p>
                <p>${{poster.year}}, ${{poster.location}}</p>
            `;
            postersSection.appendChild(posterElement);
        }});
        academicWorkContainer.appendChild(postersSection);

        // Public Talks
        const talksSection = createSection('Public Talks');
        content.academic_work.public_talks.forEach(talk => {{
            const talkElement = document.createElement('div');
            talkElement.className = 'academic-item';
            talkElement.innerHTML = `
                <h3>${{talk.title}}</h3>
                <p>${{talk.event}}</p>
                <p>${{talk.date}}, ${{talk.location}}</p>
            `;
            talksSection.appendChild(talkElement);
        }});
        academicWorkContainer.appendChild(talksSection);

        // Workshops
        const workshopsSection = createSection('Workshops');
        content.academic_work.workshops.forEach(workshop => {{
            const workshopElement = document.createElement('div');
            workshopElement.className = 'academic-item';
            workshopElement.innerHTML = `
                <h3>${{workshop.title}}</h3>
                <p>${{workshop.organization}}</p>
                <p>${{workshop.date}}, ${{workshop.location}}</p>
            `;
            workshopsSection.appendChild(workshopElement);
        }});
        academicWorkContainer.appendChild(workshopsSection);
    }}
}}

function populateWorkExperience() {{
    populateCommonElements();
    const workExperienceContainer = document.getElementById('work-experience-container');
    if (workExperienceContainer) {{
        content.work_experience.forEach(job => {{
            const jobElement = document.createElement('div');
            jobElement.className = 'work-item';
            jobElement.innerHTML = `
                <h2>${{job.title}}</h2>
                <h3>${{job.company}}</h3>
                <p>${{job.location}} | ${{job.dates}}</p>
                <ul>
                    ${{job.responsibilities.map(resp => `<li>${{resp}}</li>`).join('')}}
                </ul>
            `;
            workExperienceContainer.appendChild(jobElement);
        }});
    }}
}}

function createSection(title) {{
    const section = document.createElement('section');
    section.id = title.toLowerCase().replace(/ +/g, '-');
    section.innerHTML = `<span class="anchor" id="${{title}}-anchor"></span><h2>${{title}}</h2>`;
    return section;
}}


// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
    anchor.addEventListener('click', function (e) {{
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({{
            behavior: 'smooth'
        }});
    }});
}});

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
"""

    with open('script.js', 'w') as js_file:
        js_file.write(js_content)

if __name__ == "__main__":
    generate_js()
    print("script.js has been generated successfully.")
