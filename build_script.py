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
        // Social media icons mapping
        const socialIcons = {{
            github: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
            linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
            twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
            google: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11v2.4h3.97c-.16 1.029-1.2 3.02-3.97 3.02-2.39 0-4.34-1.979-4.34-4.42 0-2.44 1.95-4.42 4.34-4.42 1.36 0 2.27.58 2.79 1.08l1.9-1.83c-1.22-1.14-2.8-1.83-4.69-1.83-3.87 0-7 3.13-7 7s3.13 7 7 7c4.04 0 6.721-2.84 6.721-6.84 0-.46-.051-.81-.111-1.16h-6.61zm0 0 17 2h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z"/></svg>',
            email: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>',
            website: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/></svg>'
        }};

        content.social_links.forEach(link => {{
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.title = link.name;
            // Determine which icon to use based on the link name or URL
            let iconKey = link.name.toLowerCase();
            // Try to match the URL if the name doesn't match any icon
            if (!socialIcons[iconKey]) {{
                if (link.url.includes('github')) iconKey = 'github';
                else if (link.url.includes('linkedin')) iconKey = 'linkedin';
                else if (link.url.includes('twitter')) iconKey = 'twitter';
                else if (link.url.includes('google')) iconKey = 'google';
                else if (link.url.includes('mailto:')) iconKey = 'email';
                else iconKey = 'website';
            }}
            a.innerHTML = socialIcons[iconKey] || socialIcons.website;
            a.className = 'social-icon';
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
                <div class="education-header">
                    <div class="education-main">
                        <h2>${{edu['degree']}}</h2>
                        <h3>${{edu['institution']}}</h3>
                    </div>
                    <div class="education-meta">
                        <p class="location">${{edu['location']}}</p>
                        <p class="dates">${{edu['dates']}}</p>
                    </div>
                </div>
                <p class="grade">${{edu['grade']}}</p>
                <p class="description">${{edu['description']}}</p>
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
                <div class="work-header">
                    <div class="work-main">
                        <h2>${{job['title']}}</h2>
                        <h3>${{job['company']}}</h3>
                    </div>
                    <div class="work-meta">
                        <p class="location">${{job['location']}}</p>
                        <p class="dates">${{job['dates']}}</p>
                    </div>
                </div>
                <ul>
                    ${{job['responsibilities'].map(resp => `<li>${{resp}}</li>`).join('')}}
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

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();
"""

    with open('script.js', 'w') as js_file:
        js_file.write(js_content)

if __name__ == "__main__":
    generate_js()
    print("script.js has been generated successfully.")
