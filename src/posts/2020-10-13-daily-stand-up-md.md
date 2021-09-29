---
title: Organization of the Daily Stand Up with Markdown
description: How I use a plain text file to organize my Daily Stand-Up
layout: post
date: 2020-10-13 12:00:00 +0200
tags: [organisation, plaintext, scrum]
categories: organization
lang: en
---

Stand-ups are meetings recommended by the [SCRUM methodology](https://en.wikipedia.org/wiki/Stand-up_meeting). In these small meetings of fifteen minutes maximum, everyone takes the floor to say quickly what they worked on the previous day, the work planned for the same day and the blocking points (if any).

The goal is to keep it short because the main drift of these meetings is to drag out the work and thus [demotivate everyone](https://www.usehaystack.io/blog/we-cancelled-standups-and-let-the-team-build-heres-what-happened). It is normally the role of the SCRUM master to manage speaking time but in order to better manage my speaking time I use my `daily.md`.

So I start the day by defining the tasks I want to do during the day in a [Markdown file](https://commonmark.org/) like this:

```markdown
Monday, September 1st

- [ ] end feature A
- [ ] define requirements for a feature B
```

Then, as the day progresses, I tick off the tasks that have been completed. If I have completed additional tasks, I add them.

```markdown
Monday, September 1st

- [x] end feature
- [x] debug problem on staging server
- [ ] define requirements for a feature Be
```

The next day, I do the same thing by adding the new day. All the tasks I didn't do the day before can be found in my forecast for the day.

```markdown
Monday, September 1st

- [x] end feature
- [x] debug problem on staging server
- [ ] define requirements for a feature B

Tuesday, September 2nd

- [ ] define requirements for a feature B
- [ ] start new feature C
- [ ] take ticket QA
```

What is practical is that for the Daily Stand I can consult this file and thus be more concise about what I did without trying to remember the day before or the Friday before.

I find that this method has several advantages:

1. It allows you to set goals for the day and thus to motivate yourself.
2. It allows you to keep track of everything you have achieved and will later allow you to easily build up a skills assessment.
3. It is really very quick to set up and does not require any software.

I don't pretend to say that it is the miracle method but it seems useful to me.
