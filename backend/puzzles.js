// Each puzzle is a short, deliberately tricky text conversation between two people,
// tagged "boy" and "girl" purely to render chat bubbles on opposite sides.
//
// IMPORTANT: the correct answer is NEVER derived from the player's own gender.
// Every puzzle explicitly names which speaker is being judged (`targetPerson`,
// "boy" | "girl"), and stores ONE correct `verdict` ("red" | "green") + one
// `explanation` for that person's behavior. Every player — regardless of the
// gender they registered with — sees the exact same question and the exact
// same correct answer for a given day's puzzle.
//
// `skill` tags loosely group puzzles by the relationship-literacy theme they
// exercise (mirrors the `skills` table in the database schema).

export const PUZZLES = [
  {
    id: "p01",
    title: "The Late Reply",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "hey! sorry for the late reply, work was insane today" },
      { s: "girl", t: "it's fine lol you don't have to explain yourself to me" },
      { s: "boy", t: "no I want to, I don't like leaving you on read all day" },
      { s: "girl", t: "honestly? kind of a green flag that you even said that" },
      { s: "boy", t: "haha I just think communication shouldn't be a mystery game" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He explains himself without being asked and names why communication matters to him, instead of going silent and letting her guess.",
  },
  {
    id: "p02",
    title: "Checking In",
    skill: "control",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "who were you with tonight?" },
      { s: "boy", t: "just the guys from work, why?" },
      { s: "girl", t: "no reason, just send me a pic next time so I know it's true" },
      { s: "boy", t: "...you want proof?" },
      { s: "girl", t: "I mean if you have nothing to hide it's not a big deal right" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "\"Send proof if you have nothing to hide\" reframes surveillance as innocent — a classic control tactic dressed up as reasonable.",
  },
  {
    id: "p03",
    title: "The Apology",
    skill: "accountability",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "I shouldn't have raised my voice earlier. that wasn't okay." },
      { s: "girl", t: "it's fine, I probably provoked it anyway" },
      { s: "boy", t: "no — even if we disagreed, yelling isn't how I want to handle it. I'm working on it." },
      { s: "girl", t: "you don't have to make it a whole thing, I already forgave you" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "She takes the blame for his outburst and rushes past accountability — minimizing harm instead of letting it be addressed is a quiet warning sign.",
  },
  {
    id: "p04",
    title: "Future Plans",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "my sister's wedding is in June, I already told her you're coming" },
      { s: "boy", t: "oh — we haven't really talked about where this is going yet though" },
      { s: "girl", t: "it's just a wedding, don't overthink it" },
      { s: "boy", t: "I'm not, I just don't want to commit to things before we're on the same page" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "She's making commitments on his behalf and brushing off his hesitation instead of checking in first — deciding the relationship's pace for both of them.",
  },
  {
    id: "p05",
    title: "Bad Day",
    skill: "support",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "ugh today was rough, my presentation flopped" },
      { s: "girl", t: "want to talk about it or want me to just distract you?" },
      { s: "boy", t: "distraction please" },
      { s: "girl", t: "say less, sending you the dumbest video I saw today" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She asks what kind of support he actually wants instead of assuming — and follows through on exactly that.",
  },
  {
    id: "p06",
    title: "The Joke",
    skill: "respect",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "everyone laughed when you tripped lol you should've seen your face" },
      { s: "girl", t: "that actually kind of embarrassed me in front of your friends" },
      { s: "boy", t: "relax it's not that deep, you're too sensitive" },
      { s: "girl", t: "okay... sorry" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "\"You're too sensitive\" dismisses her feelings instead of hearing them — a common way of avoiding responsibility by relabeling her reaction as the problem.",
  },
  {
    id: "p07",
    title: "Old Photos",
    skill: "trust",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "can you take down the photos with your ex still on your page?" },
      { s: "boy", t: "yeah that's fair, didn't even think about it, done" },
      { s: "girl", t: "thank you, it's not that I don't trust you, it just felt weird" },
      { s: "boy", t: "no you don't owe me an explanation, makes sense" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She names a real discomfort clearly and owns that it's about her feelings, not an accusation — asking instead of quietly resenting him.",
  },
  {
    id: "p08",
    title: "Silent Treatment",
    skill: "communication",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "hey, still thinking about this morning?" },
      { s: "girl", t: "..." },
      { s: "boy", t: "come on, at least tell me what I did" },
      { s: "girl", t: "if you don't know then I'm not going to explain it to you" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "Withholding the reason as punishment forces him to guess and grovel — stonewalling rather than communicating what actually hurt her.",
  },
  {
    id: "p09",
    title: "The Surprise",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "I kind of want to plan something for your birthday but I don't know your friends well" },
      { s: "boy", t: "honestly you don't have to, low-key is fine, I appreciate the thought though" },
      { s: "girl", t: "no I want to, just tell me who to invite" },
      { s: "boy", t: "okay, I'll send you names tonight, thank you for even asking" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He states a genuine preference and still receives her effort warmly instead of either demanding more or shutting it down.",
  },
  {
    id: "p10",
    title: "Location Sharing",
    skill: "control",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "why'd you turn off your location? you had it on last week" },
      { s: "girl", t: "I just don't want to share it 24/7, it felt like a lot" },
      { s: "boy", t: "we're dating though, what's the point of hiding it" },
      { s: "girl", t: "it's not hiding, I just want some things to be mine" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Framing a normal boundary as \"hiding\" and treating constant tracking as owed is a control pattern, even when it's phrased as a simple question.",
  },
  {
    id: "p11",
    title: "Meeting Friends",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "my friends want to meet you finally, dinner Friday?" },
      { s: "boy", t: "can we push it? I've had a lot going on and want to be actually present" },
      { s: "girl", t: "sure, whenever works, no rush" },
      { s: "boy", t: "you're not annoyed?" },
      { s: "girl", t: "no, I'd rather you come when you actually want to be there" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She takes his reason at face value instead of reading rejection into it, and genuinely means the reschedule.",
  },
  {
    id: "p12",
    title: "The Compliment",
    skill: "respect",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "you looked way better before you cut your hair, just saying" },
      { s: "girl", t: "oh. I actually really like it now" },
      { s: "boy", t: "I'm just being honest, most guys would agree with me" },
      { s: "girl", t: "okay well I didn't cut it for most guys" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Framing an unsolicited, deflating opinion as \"just honesty\" and invoking other men's approval is a way of pressuring her to look how he wants.",
  },
  {
    id: "p13",
    title: "Money Talk",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "hey can you send the rent split, it's due tomorrow" },
      { s: "boy", t: "oh it's already late this month, my bad — sending now, and sorry for the stress" },
      { s: "girl", t: "no worries, thanks for not making it weird" },
      { s: "boy", t: "of course, it's just money, not worth an argument" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He owns being late without excuses or guilt-tripping her for asking, and resolves it quickly.",
  },
  {
    id: "p14",
    title: "The Vague Plan",
    skill: "communication",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "so are we exclusive or...?" },
      { s: "girl", t: "why do we need a label, let's just see where it goes" },
      { s: "boy", t: "I mean I'd just like to know where I stand" },
      { s: "girl", t: "you're overthinking it, just enjoy it" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "Repeatedly deflecting a direct, reasonable question with \"don't overthink it\" keeps him uncertain on purpose, which benefits her, not the relationship.",
  },
  {
    id: "p15",
    title: "The Grand Gesture",
    skill: "accountability",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "I showed up at your work with flowers, wasn't that romantic?" },
      { s: "girl", t: "I told you I was slammed today, that actually put me in an awkward spot" },
      { s: "boy", t: "wow, okay, I do something nice and get criticized for it" },
      { s: "girl", t: "I'm not criticizing you, I'm telling you how it felt" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "He turns her feedback into an accusation against himself to avoid hearing it — a way of shutting down criticism by playing the victim.",
  },
  {
    id: "p16",
    title: "Different Opinions",
    skill: "respect",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "I really don't think that movie was good, ngl" },
      { s: "boy", t: "how could you not like it, that's actually wild to me" },
      { s: "girl", t: "we're just going to disagree on this one lol" },
      { s: "boy", t: "fine, whatever you say" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "Even a little exasperated, he doesn't push it into a real fight — mild teasing over a movie isn't a red flag on its own.",
  },
  {
    id: "p17",
    title: "In a Meeting",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "you didn't answer for 20 mins, everything ok?" },
      { s: "boy", t: "yeah sorry, I was in a client meeting, phone was on silent" },
      { s: "girl", t: "next time just text before so I'm not sitting here wondering" },
      { s: "boy", t: "that's fair, I'll give you a heads up when I know it's a long one" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She names what would actually help her instead of demanding constant availability — a specific, reasonable ask, not a control move.",
  },
  {
    id: "p18",
    title: "The Ex's Text",
    skill: "trust",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "my ex texted me happy birthday, I said thanks and left it there" },
      { s: "girl", t: "why are you even telling me this like it's nothing" },
      { s: "boy", t: "because I'd rather you hear it from me than find it and wonder" },
      { s: "girl", t: "oh. okay, yeah, I appreciate that actually" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He surfaces something small and mildly awkward on his own instead of hiding it and hoping it never comes up — that's what earns trust.",
  },
  {
    id: "p19",
    title: "Splitting the Bill",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "want to just split this one? I got the last two" },
      { s: "girl", t: "of course, didn't even think about keeping score" },
      { s: "boy", t: "same, just flagging it so it doesn't feel one-sided over time" },
      { s: "girl", t: "makes sense, let's Venmo it now so neither of us forgets" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "Bringing up money directly and early, without resentment attached, heads off the slow-burn kind of imbalance that turns into a real fight later.",
  },
  {
    id: "p20",
    title: "Need Some Quiet",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "you've been quiet since you got home, what's wrong?" },
      { s: "boy", t: "nothing's wrong, I just need like 20 minutes to decompress before I talk" },
      { s: "girl", t: "are you mad at me though" },
      { s: "boy", t: "no, I promise, I'll come find you the second I'm ready" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "Naming a need for space and giving a clear timeframe and follow-through isn't shutting her out — it's the opposite of stonewalling.",
  },
  {
    id: "p21",
    title: "The Comparison",
    skill: "respect",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "why can't you be more chill about stuff, like Priya is with her boyfriend" },
      { s: "girl", t: "that's a weird thing to bring up" },
      { s: "boy", t: "I'm just saying, other people don't make everything a conversation" },
      { s: "girl", t: "having feelings isn't a flaw you get to compare me out of" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Holding her up against another couple to make her feel like the problem is a pressure tactic, not honest feedback — it's meant to make her stop bringing things up.",
  },
  {
    id: "p22",
    title: "Bringing Up Therapy",
    skill: "support",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "I've been thinking about starting therapy, just to have a space to unpack stuff" },
      { s: "boy", t: "that's a great idea honestly, want help finding someone?" },
      { s: "girl", t: "maybe, I was worried you'd think it meant something's wrong with us" },
      { s: "boy", t: "no, it means you're taking care of yourself, that's good for both of us" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He treats her wanting support as a good thing instead of a threat or an insult to him — no defensiveness, just encouragement.",
  },
  {
    id: "p23",
    title: "Forgotten Date",
    skill: "accountability",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "wait, was today our anniversary? I completely blanked, I'm so sorry" },
      { s: "girl", t: "yeah... it kind of stung not hearing from you all day" },
      { s: "boy", t: "that's on me, no excuse — let me actually plan something this weekend to make up for it" },
      { s: "girl", t: "I'd like that, thank you for not brushing it off" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He doesn't minimize the mistake or get defensive — he owns it plainly and offers a concrete repair instead of just a word.",
  },
  {
    id: "p24",
    title: "Liking Old Photos",
    skill: "trust",
    difficulty: "hard",
    messages: [
      { s: "girl", t: "I saw you liked a bunch of your coworker's old bikini photos" },
      { s: "boy", t: "it's Instagram, I like stuff all the time, it's not a big deal" },
      { s: "girl", t: "it made me uncomfortable, that's all I'm saying" },
      { s: "boy", t: "you're being insecure, I can't control how you feel about it" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Instead of just hearing her out, he labels her discomfort as \"insecurity\" and disowns any responsibility — a way to dodge a fair conversation about his behavior.",
  },
  {
    id: "p25",
    title: "Meeting the Parents",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "my mom asked when she's meeting you, no pressure though, whenever you're ready" },
      { s: "girl", t: "honestly kind of nervous but I'd like to, maybe in a couple weeks?" },
      { s: "boy", t: "works for me, I'll tell her, and hey, she'll like you, don't stress" },
      { s: "girl", t: "thanks for not pushing it before I was ready" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He raises something that matters to him without turning it into pressure, and lets her set the pace.",
  },
  {
    id: "p26",
    title: "The Weight Comment",
    skill: "respect",
    difficulty: "hard",
    messages: [
      { s: "girl", t: "have you been going to the gym less? just noticed, wondering if you're okay" },
      { s: "boy", t: "work's been packed, why, do I look different" },
      { s: "girl", t: "a little, I just want you to feel good, that's all I meant" },
      { s: "boy", t: "okay, thanks for checking, I'll try to get back into it" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She raises a physical change gently, frames it around his wellbeing rather than appearance, and doesn't push once she's said it — concern, not criticism.",
  },
  {
    id: "p27",
    title: "Love Languages",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "I know gifts aren't really your love language but I saw this and thought of you" },
      { s: "girl", t: "you remembered that conversation? that means more than the gift honestly" },
      { s: "boy", t: "I pay attention, it's kind of my whole thing" },
      { s: "girl", t: "well, keep it up then" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He applies something specific she told him instead of defaulting to generic gestures — actually listening, not just performing effort.",
  },
  {
    id: "p28",
    title: "The Hidden Purchase",
    skill: "trust",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "hey did you order something? saw a charge I didn't recognize" },
      { s: "girl", t: "oh, it's nothing, don't worry about it" },
      { s: "boy", t: "it's a shared account though, I'm not trying to interrogate you, just asking" },
      { s: "girl", t: "why does it matter, it's not like I asked about every dollar you spend" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "Deflecting a reasonable, calm question on a shared account with \"why does it matter\" turns a simple ask into secrecy — the evasiveness is the flag, not the purchase.",
  },
  {
    id: "p29",
    title: "Moving In",
    skill: "communication",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "I've been thinking, would you ever want to move in together?" },
      { s: "boy", t: "I've thought about it too, but honestly I want a few more months before that jump" },
      { s: "girl", t: "can I ask why? I'm not trying to pressure you, just curious" },
      { s: "boy", t: "just want to make sure it's for the right reasons, not because leases are ending" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He doesn't dodge the question or panic — he gives a real, specific reason for the pace he wants, which respects the conversation rather than shutting it down.",
  },
  {
    id: "p30",
    title: "The Coworker Friendship",
    skill: "control",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "you talk to Sam from work a lot, I'd feel better if you kept it more professional" },
      { s: "girl", t: "we're just friends, he's helped me a ton with onboarding" },
      { s: "boy", t: "I'm not saying stop being friendly, I just don't love how much you two text" },
      { s: "girl", t: "so you want me to have fewer work friends because it bothers you?" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Dressed as a mild preference, this is still asking her to shrink a normal friendship to manage his insecurity — the ask is about controlling her behavior, not a boundary about his own.",
  },
  {
    id: "p31",
    title: "The Health Scare",
    skill: "support",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "the doctor wants to run more tests, I'm trying not to spiral" },
      { s: "boy", t: "I'm coming with you to the appointment, I already cleared my calendar" },
      { s: "girl", t: "you don't have to do that, it's probably nothing" },
      { s: "boy", t: "probably, but I'd rather be there than find out later you sat through that alone" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He shows up without being asked and doesn't let her downplay it talk him out of it — steady support instead of waiting for a formal request.",
  },
  {
    id: "p32",
    title: "The Pet Peeve",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "small thing, but could you not leave dishes in the sink overnight? it's a pet peeve of mine" },
      { s: "girl", t: "oh, totally fair, I didn't realize it bothered you that much, I'll be better about it" },
      { s: "boy", t: "appreciate it, and tell me if I've got annoying habits too, I'm sure I do" },
      { s: "girl", t: "noted, we'll trade lists" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He raises a small annoyance directly and calmly instead of letting it fester, and invites the same honesty back — low-stakes, healthy communication.",
  },
  {
    id: "p33",
    title: "Long Distance Check-In",
    skill: "trust",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "you went quiet for a few hours, I started imagining things" },
      { s: "boy", t: "sorry, I was out with friends and lost track of time, that's on me" },
      { s: "girl", t: "can you just text 'talk later' next time? doesn't need to be long" },
      { s: "boy", t: "yeah, that's a fair ask, I'll do that" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "Instead of accusing him or demanding constant updates, she asks for one small, specific thing that would actually solve the anxiety — reasonable, not controlling.",
  },
  {
    id: "p34",
    title: "The Job Offer",
    skill: "communication",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "I got the offer, it's a great role but it's in another city" },
      { s: "girl", t: "that's amazing, congratulations, seriously" },
      { s: "boy", t: "I haven't decided anything, I wanted to talk it through with you first" },
      { s: "girl", t: "I appreciate that, let's actually sit down with the details tonight" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She's genuinely happy for him before making it about herself, and meets a big decision with a real conversation instead of guilt or an ultimatum.",
  },
  {
    id: "p35",
    title: "Public Argument",
    skill: "respect",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "you always do this, embarrass me in front of people" },
      { s: "girl", t: "can we not do this here, let's talk at home" },
      { s: "boy", t: "no, everyone should hear how difficult you're being right now" },
      { s: "girl", t: "I'm going to head out, text me when you're ready to actually talk" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Escalating a disagreement in public and refusing a reasonable ask to take it private is meant to humiliate and corner her, not resolve anything.",
  },
  {
    id: "p36",
    title: "The Passive-Aggressive Fine",
    skill: "communication",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "you okay? you've said 'fine' three times tonight" },
      { s: "boy", t: "I'm fine." },
      { s: "girl", t: "you clearly aren't, and that's okay, I just want to know what's going on" },
      { s: "boy", t: "whatever, if you don't already know then forget it" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Repeating \"fine\" while clearly upset, then blaming her for not reading his mind, is a way of punishing her without ever naming the actual issue.",
  },
  {
    id: "p37",
    title: "The Stranger Compliment",
    skill: "respect",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "the barista was cute, not gonna lie" },
      { s: "girl", t: "haha okay, noted" },
      { s: "boy", t: "you're not bothered? I feel like I should hide stuff like that" },
      { s: "girl", t: "noticing someone's cute isn't cheating, I'd rather you just be honest" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She doesn't punish a harmless, honest observation — treating normal human noticing as a betrayal is what actually pushes people toward hiding things.",
  },
  {
    id: "p38",
    title: "Weekend Plans, Decided",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "told my parents we'd come up this weekend, hope that's fine" },
      { s: "girl", t: "I actually already told my friend I'd help her move Saturday" },
      { s: "boy", t: "can you push that? I already said yes for us" },
      { s: "girl", t: "next time can we check with each other before committing either of us to plans?" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She doesn't just cave to a plan made without her — she names the actual fix (check before committing) instead of quietly resenting it or blowing up.",
  },
  {
    id: "p39",
    title: "The Layoff",
    skill: "support",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "I got laid off today. I don't even know what to say right now" },
      { s: "boy", t: "I'm so sorry, that's awful — I'm coming over, you don't need to be alone tonight" },
      { s: "girl", t: "I might just want to sit in it for a bit, not really talk" },
      { s: "boy", t: "that's fine, I'll just be there, we don't have to talk about it at all" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He shows up for her without forcing a conversation she isn't ready for — presence without demands is real support.",
  },
  {
    id: "p40",
    title: "Talking About Kids",
    skill: "communication",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "I've been thinking, I don't actually want kids, and I should've said that sooner" },
      { s: "girl", t: "thank you for telling me now instead of years in. that's a big one for me though" },
      { s: "boy", t: "I know, and I don't expect you to just get over it, I just didn't want to keep pretending" },
      { s: "girl", t: "I need some time to think about what this means for us" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "A hard, potentially relationship-ending truth said honestly and early — even though it's painful — is far healthier than stringing someone along.",
  },
  {
    id: "p41",
    title: "Political Difference",
    skill: "respect",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "I saw the news today, we probably see that pretty differently" },
      { s: "boy", t: "yeah, probably. want to actually talk about it or leave it alone tonight?" },
      { s: "girl", t: "let's leave it, I don't want to turn dinner into a debate" },
      { s: "boy", t: "deal, we can hash it out another time if you ever want to" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He checks whether she even wants to go there and respects the answer instead of pushing his view on her — disagreement handled with care, not conflict avoidance forever.",
  },
  {
    id: "p42",
    title: "After the Funeral",
    skill: "support",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "you've been quiet since the funeral, I'm here whenever you want to talk" },
      { s: "girl", t: "I don't really know how to put it into words yet" },
      { s: "boy", t: "you don't have to. I'm not going anywhere, take whatever time you need" },
      { s: "girl", t: "thank you for not needing me to explain it" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He offers space without an agenda and doesn't need grief explained on his timeline — patience without pressure.",
  },
  {
    id: "p43",
    title: "Late Pickup",
    skill: "accountability",
    difficulty: "easy",
    messages: [
      { s: "girl", t: "you were supposed to grab me 40 minutes ago, I've just been standing here" },
      { s: "boy", t: "I completely lost track of time, I'm so sorry, I'm on my way right now" },
      { s: "girl", t: "okay, just next time send a heads up if you're running late" },
      { s: "boy", t: "you're right, I should've texted the second I realized, won't happen again" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He apologizes plainly, doesn't make excuses, and agrees with the fix she asks for instead of getting defensive about a real mistake.",
  },
  {
    id: "p44",
    title: "The Drinking Boundary",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "can we talk about how much you drank at the party last night?" },
      { s: "boy", t: "here we go, you're always keeping count" },
      { s: "girl", t: "I'm not keeping count, I'm telling you it worried me" },
      { s: "boy", t: "you're overreacting, it was one night" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Deflecting with \"you're always\" and \"you're overreacting\" shuts down a legitimate concern before it can even be discussed — that's avoidance, not a defense.",
  },
  {
    id: "p45",
    title: "Her Promotion",
    skill: "respect",
    difficulty: "hard",
    messages: [
      { s: "girl", t: "I got the promotion! I'll actually be making more than you now" },
      { s: "boy", t: "that's incredible, seriously, you worked so hard for this, I'm proud of you" },
      { s: "girl", t: "you sure you're okay with the money thing? I know that's a lot to sit with" },
      { s: "boy", t: "more than okay, this is good for us, not a competition" },
    ],
    targetPerson: "boy",
    verdict: "green",
    explanation:
      "He responds to her success with genuine pride instead of letting ego or comparison creep in — no defensiveness about the money shift at all.",
  },
  {
    id: "p46",
    title: "Birthday Text to an Ex",
    skill: "trust",
    difficulty: "hard",
    messages: [
      { s: "boy", t: "did you seriously wish your ex happy birthday? we've been dating six months" },
      { s: "girl", t: "it was one message, we're not close, you're making this bigger than it is" },
      { s: "boy", t: "I'm allowed to feel weird about it without you dismissing it" },
      { s: "girl", t: "you're allowed to feel weird, I just don't think it means anything happened" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She doesn't get defensive or hide anything — she acknowledges his feeling is valid while calmly holding that a polite message isn't a betrayal. That balance is healthy, not dismissive.",
  },
  {
    id: "p47",
    title: "Splitting Chores",
    skill: "communication",
    difficulty: "easy",
    messages: [
      { s: "boy", t: "I feel like I've been doing most of the cleaning lately, can we rebalance?" },
      { s: "girl", t: "you're right, honestly I hadn't noticed, let's actually make a list" },
      { s: "boy", t: "appreciate you not getting defensive about it" },
      { s: "girl", t: "it's a fair thing to bring up, better to fix it than let it build up" },
    ],
    targetPerson: "girl",
    verdict: "green",
    explanation:
      "She hears the complaint without getting defensive and moves straight to a concrete fix — exactly how a fair-division conversation should go.",
  },
  {
    id: "p48",
    title: "Alone Time on Vacation",
    skill: "boundaries",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "would it be weird if I went for a solo walk this morning instead of the group thing?" },
      { s: "boy", t: "we planned this whole trip around doing things together though" },
      { s: "girl", t: "I know, I just need an hour to myself, then I'm all in for the rest of the day" },
      { s: "boy", t: "fine, I guess, if that's what you need" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Guilting a small, reasonable request for an hour of solo time by invoking \"the whole trip\" makes her ask for space feel like a betrayal instead of just being normal.",
  },
  {
    id: "p49",
    title: "The Reversal",
    skill: "respect",
    difficulty: "medium",
    messages: [
      { s: "girl", t: "you've put on a bit of weight since we started dating, just noticing" },
      { s: "boy", t: "damn, okay, wasn't expecting that out of nowhere" },
      { s: "girl", t: "I'm just being honest, most girls would say the same thing" },
      { s: "boy", t: "maybe, but I didn't ask, and I don't love how that landed" },
    ],
    targetPerson: "girl",
    verdict: "red",
    explanation:
      "Unsolicited criticism about his body, backed up with \"most girls would agree,\" is the same pressure tactic regardless of who it's aimed at — it's not honesty, it's control dressed as feedback.",
  },
  {
    id: "p50",
    title: "The Big Purchase",
    skill: "communication",
    difficulty: "medium",
    messages: [
      { s: "boy", t: "I put a deposit down on the car today, figured we talked about it enough already" },
      { s: "girl", t: "wait, I thought we were still deciding together, that's a shared account" },
      { s: "boy", t: "you're right, I got excited and jumped ahead, I should've waited for you" },
      { s: "girl", t: "I appreciate you saying that, let's actually finalize it together tonight" },
    ],
    targetPerson: "boy",
    verdict: "red",
    explanation:
      "Committing shared money before the joint decision was actually made — then admitting it — doesn't undo that he acted alone on something that affects both of them.",
  },
];

export function publishedPuzzles() {
  return PUZZLES;
}
