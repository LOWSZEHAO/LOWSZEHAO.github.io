# What's left

Updated after wiring in the four training videos. Everything you have answered has been
applied and removed from here.

> **This file is committed, and the repository is public once you push it.** To keep these
> notes private, add `CHECKLIST.md` to `.gitignore` before your first commit.

---

## 0. Live

**<https://lowszehao.github.io/portfolio/>** — deployed 23 October 2026.

Every push to `main` rebuilds and redeploys automatically. The workflow type-checks, builds
and runs `npm run verify` before publishing, so a broken link or a leaked draft stops the
deployment instead of shipping.

To move to the shorter `lowszehao.github.io/`, rename the repo to `LOWSZEHAO.github.io` on
GitHub — `astro.config.mjs` detects it and adjusts the base path with no code change.

---

## 2. The two videos with visible capture problems

Both are real and a recruiter will see them. Neither is hard to fix.

- [ ] **Safety Rescue — casualty handling** (`hziNDMfayQ8`) is a **play-in-editor capture**.
      The Windows taskbar is along the bottom, and Unreal's debug text is in the top-left,
      including `LIGHTING NEEDS TO BE REBUILT (1144 unbuilt objects)`. On an engineer's
      portfolio that reads as unfinished work rather than a delivered product.
      Recapture from a packaged build, or from a maximised PIE window with
      `DisableAllScreenMessages` and the taskbar hidden.
- [ ] **Construction Safety — lifting operation** (`4yxLiXFV6vc`) has the
      **"Activate Windows" watermark** in the bottom-right.
- [ ] Re-upload and swap the id in `src/content/projects/industrial-vr-training.md`. The
      poster stills in `src/assets/projects/vr-training/` come from the videos, so replace
      those too.

To drop a clip entirely in the meantime, delete its four lines from the `videos:` list — the
gallery relayouts on its own, no gaps.

---

## 3. The training case study — making it interview-proof

The page is published and accurate, but it is written from what I could verify: the titles,
what is visible in the footage, and your own CV wording. Two sections are thinner than they
should be because only you have the material.

- [ ] **Sharpen "My role".** It currently states what you do across this work in general.
      Stronger: which systems on *these* modules were yours to design, which you extended,
      and which were someone else's. A precise limited claim beats a broad one, and this is
      the question an interviewer will push hardest on.
- [ ] **Add an engineering-challenges section.** There is none, because I will not invent one.
      Two or three specifics — a tracking or interaction bug you chased down, a performance
      ceiling on the standalone build, a procedure that did not map cleanly onto something
      interactive — each with the problem, what you tried, and what worked. This is the
      section that converts a watch into an interview.
- [ ] **Confirm employer permission**, if you have not already. The videos are yours to
      publish or not; I have kept client names, source, and internal architecture off the
      page regardless.

**On the videos being Unlisted:** all four are, which is correct — they are not searchable or
indexed. But an unlisted link on a public page is reachable by anyone who opens the page.
Treat them as public.

---

## 4. FlexXR — still the biggest single upgrade

- [ ] **Record it running.** The case study is strong and the architecture diagram is real,
      but there is no footage, and the page says so. Thirty seconds in-headset — grabbing a
      prop, opening a latched door, teleporting — now that the training page has four clips,
      the contrast is noticeable.

      Add to `src/assets/projects/flex-xr/` and set `cover:`, or upload a clip and add a
      `videos:` entry exactly like the training page's.

---

## 5. Optional

- [ ] **CV.** `cv` is still `null` in `src/data/site.ts`, so the Download CV button stays
      hidden. Set it to `/cv/<filename>.pdf` once you have a PDF you are happy with in
      `public/cv/`.
- [ ] **Education years** → the `period` fields in `src/data/site.ts`, currently `null` so the
      dates line is omitted.
- [ ] **Delete `AGENTS.md`** if you would rather not ship Astro's AI-agent notes in a public
      portfolio repo.

---

## 6. Answered, for the record

- **Custom domain:** not needed. GitHub Pages gives you a free, permanent, HTTPS URL.
- **Repository name:** any name works. `LOWSZEHAO.github.io` gives the shorter URL.
- **MechadiumVR:** removed.
- **Uplink:** published as a research project, not featured, AI authorship stated in the first
  line of the case study and on the card.
- **Training videos:** all four published, client identities and internal architecture
  withheld.

---

## 7. Things deliberately not done

- **No contact form.** A static site has no backend; a form that silently discards messages is
  worse than an email link.
- **No analytics or tracking.** None installed. The video embeds load nothing from YouTube
  until someone presses play, so the page has no third-party request on open.
- **No GitHub activity graph, star counts or download numbers.**
- **No proficiency bars or percentages.**
- **No Namestead source link.** Commercial product, private repo.
- **No phone number on the website.**
- **No client names anywhere**, including in filenames and commit history.
- **No testimonials, awards or commercial results.** Nothing verified to put there.
