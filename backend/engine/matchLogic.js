/**
 * TDC Matchmaker Engine
 * Gender-specific matching logic with weighted scoring (0-100)
 */

// --- Helpers ---
const ageDiff = (a, b) => a.age - b.age;
const incomeDiff = (a, b) => a.income - b.income;
const heightDiff = (a, b) => a.height - b.height;

const sharedLanguages = (a, b) => {
  const setB = new Set(b.languages);
  return a.languages.filter((l) => setB.has(l)).length;
};

const kidsCompatible = (a, b) => {
  if (a.wantKids === b.wantKids) return true;
  if (a.wantKids === 'maybe' || b.wantKids === 'maybe') return true;
  return false;
};

const relocateCompatible = (a, b) => {
  if (a.openToRelocate === 'yes' || b.openToRelocate === 'yes') return true;
  if (a.openToRelocate === 'no' && b.openToRelocate === 'no') return false;
  return true;
};

const religionMatch = (a, b) => a.religion === b.religion;
const casteMatch = (a, b) => a.caste === b.caste;
const dietMatch = (a, b) => {
  if (a.diet === b.diet) return true;
  if (a.diet === 'eggetarian' && b.diet === 'vegetarian') return true;
  if (a.diet === 'vegetarian' && b.diet === 'eggetarian') return true;
  return false;
};

const educationLevel = (degree) => {
  if (!degree) return 0;
  const d = degree.toLowerCase();
  if (d.includes('phd') || d.includes('doctorate')) return 5;
  if (d.includes('md') || d.includes('mbbs')) return 4;
  if (d.includes('mba') || d.includes('m.tech') || d.includes('m.sc') || d.includes('ma ') || d.includes('m.com') || d.includes('llm')) return 3;
  if (d.includes('b.tech') || d.includes('be ') || d.includes('b.e.') || d.includes('bba') || d.includes('mbbs') || d.includes('llb') || d.includes('bds') || d.includes('b.sc') || d.includes('ba ') || d.includes('b.com') || d.includes('ca') || d.includes('bhm')) return 2;
  return 1;
};

// --- MALE CLIENT: match with women (traditional spec) ---
const scoreMaleClient = (client, candidate) => {
  let score = 0;
  const reasons = [];
  const redFlags = [];

  // 1. Age — candidate should be younger (weight: 20)
  const aDiff = ageDiff(client, candidate); // positive = client older
  if (aDiff >= 1 && aDiff <= 5) { score += 20; reasons.push('Ideal age difference'); }
  else if (aDiff >= 6 && aDiff <= 8) { score += 14; reasons.push('Acceptable age gap'); }
  else if (aDiff > 8) { score += 6; redFlags.push('Large age gap'); }
  else { score += 0; redFlags.push('Candidate is older'); }

  // 2. Income — candidate earns less (weight: 18)
  const iDiff = incomeDiff(client, candidate); // positive = client earns more
  if (iDiff >= 5) { score += 18; reasons.push('Complementary income dynamic'); }
  else if (iDiff >= 1 && iDiff < 5) { score += 12; reasons.push('Similar income levels'); }
  else if (iDiff === 0) { score += 8; }
  else { score += 3; redFlags.push('Candidate earns significantly more'); }

  // 3. Height — candidate shorter (weight: 10)
  const hDiff = heightDiff(client, candidate); // positive = client taller
  if (hDiff >= 5) { score += 10; reasons.push('Height compatibility'); }
  else if (hDiff >= 0) { score += 7; }
  else { score += 2; redFlags.push('Height mismatch'); }

  // 4. Kids preference (weight: 18)
  if (client.wantKids === candidate.wantKids) { score += 18; reasons.push('Aligned on having children'); }
  else if (candidate.wantKids === 'maybe' || client.wantKids === 'maybe') { score += 10; reasons.push('Open on children preference'); }
  else { score += 0; redFlags.push('Conflicting views on children'); }

  // 5. Religion (weight: 10)
  if (religionMatch(client, candidate)) { score += 10; reasons.push('Same religion'); }
  else { score += 2; }

  // 6. Diet compatibility (weight: 6)
  if (dietMatch(client, candidate)) { score += 6; reasons.push('Matching dietary habits'); }

  // 7. Shared languages (weight: 8)
  const langs = sharedLanguages(client, candidate);
  if (langs >= 2) { score += 8; reasons.push(`${langs} shared languages`); }
  else if (langs === 1) { score += 5; reasons.push('Common language'); }

  // 8. Relocation alignment (weight: 5)
  if (relocateCompatible(client, candidate)) { score += 5; reasons.push('Compatible relocation views'); }

  // 9. Family type (weight: 5)
  if (client.familyType === candidate.familyType) { score += 5; reasons.push('Same family preference'); }

  return { score: Math.min(score, 100), reasons, redFlags };
};

// --- FEMALE CLIENT: match with men (compatibility-first spec) ---
const scoreFemaleClient = (client, candidate) => {
  let score = 0;
  const reasons = [];
  const redFlags = [];

  // 1. Education parity (weight: 20)
  const clientEdu = educationLevel(client.degree);
  const candidateEdu = educationLevel(candidate.degree);
  const eduDiff = Math.abs(clientEdu - candidateEdu);
  if (eduDiff === 0) { score += 20; reasons.push('Matching education levels'); }
  else if (eduDiff === 1) { score += 14; reasons.push('Compatible education backgrounds'); }
  else { score += 5; redFlags.push('Education level gap'); }

  // 2. Relocation compatibility (weight: 15)
  if (client.openToRelocate === 'yes' && candidate.openToRelocate === 'yes') { score += 15; reasons.push('Both open to relocation'); }
  else if (client.openToRelocate === 'no' && candidate.openToRelocate === 'no') { score += 12; reasons.push('Both prefer to stay local'); }
  else if (client.openToRelocate === 'maybe' || candidate.openToRelocate === 'maybe') { score += 9; reasons.push('Flexible on relocation'); }
  else { score += 3; redFlags.push('Relocation preference mismatch'); }

  // 3. Kids preference (weight: 18)
  if (client.wantKids === candidate.wantKids) { score += 18; reasons.push('Aligned on having children'); }
  else if (client.wantKids === 'maybe' || candidate.wantKids === 'maybe') { score += 10; reasons.push('Open on children preference'); }
  else { score += 0; redFlags.push('Conflicting views on children'); }

  // 4. Income — candidate earns same or more (weight: 12)
  const iDiff = candidate.income - client.income;
  if (iDiff >= 5) { score += 12; reasons.push('Strong financial stability'); }
  else if (iDiff >= 0) { score += 9; reasons.push('Good income compatibility'); }
  else if (iDiff >= -3) { score += 6; }
  else { score += 2; redFlags.push('Significant income difference'); }

  // 5. Age (weight: 10) — candidate 1-7 years older
  const aDiff = ageDiff(candidate, client);
  if (aDiff >= 1 && aDiff <= 5) { score += 10; reasons.push('Natural age dynamic'); }
  else if (aDiff >= 6 && aDiff <= 7) { score += 7; reasons.push('Acceptable age gap'); }
  else if (aDiff === 0) { score += 6; }
  else if (aDiff < 0) { score += 3; redFlags.push('Candidate is younger'); }
  else { score += 3; redFlags.push('Large age gap'); }

  // 6. Religion (weight: 8)
  if (religionMatch(client, candidate)) { score += 8; reasons.push('Same religion'); }

  // 7. Diet compatibility (weight: 6)
  if (dietMatch(client, candidate)) { score += 6; reasons.push('Matching dietary habits'); }

  // 8. Shared languages (weight: 6)
  const langs = sharedLanguages(client, candidate);
  if (langs >= 2) { score += 6; reasons.push(`${langs} shared languages`); }
  else if (langs === 1) { score += 3; reasons.push('Common language'); }

  // 9. Pets compatibility (weight: 5)
  if (client.openToPets === candidate.openToPets) { score += 5; reasons.push('Matching views on pets'); }
  else if (client.openToPets === 'maybe' || candidate.openToPets === 'maybe') { score += 3; }

  return { score: Math.min(score, 100), reasons, redFlags };
};

// --- Label from score ---
const getMatchLabel = (score) => {
  if (score >= 80) return { label: 'Exceptional Match', tier: 'exceptional' };
  if (score >= 65) return { label: 'High Potential', tier: 'high' };
  if (score >= 50) return { label: 'Good Match', tier: 'good' };
  if (score >= 35) return { label: 'Possible Match', tier: 'possible' };
  return { label: 'Low Compatibility', tier: 'low' };
};

// --- Main match function ---
const findMatches = (client, pool) => {
  const oppositeGender = client.gender === 'male' ? 'female' : 'male';
  const candidates = pool.filter(
    (p) =>
      p.gender === oppositeGender &&
      p.id !== client.id &&
      p.maritalStatus !== 'matched'
  );

  const scored = candidates.map((candidate) => {
    const result =
      client.gender === 'male'
        ? scoreMaleClient(client, candidate)
        : scoreFemaleClient(client, candidate);

    const { label, tier } = getMatchLabel(result.score);

    return {
      candidate: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        age: candidate.age,
        city: candidate.city,
        height: candidate.height,
        income: candidate.income,
        annualIncomeBracket: candidate.annualIncomeBracket,
        company: candidate.company,
        designation: candidate.designation,
        college: candidate.college,
        degree: candidate.degree,
        religion: candidate.religion,
        caste: candidate.caste,
        maritalStatus: candidate.maritalStatus,
        languages: candidate.languages,
        diet: candidate.diet,
        wantKids: candidate.wantKids,
        openToRelocate: candidate.openToRelocate,
        openToPets: candidate.openToPets,
        familyType: candidate.familyType,
        motherTongue: candidate.motherTongue,
        complexion: candidate.complexion,
        bodyType: candidate.bodyType,
        profilePhoto: candidate.profilePhoto,
        manglik: candidate.manglik,
      },
      score: result.score,
      label,
      tier,
      reasons: result.reasons,
      redFlags: result.redFlags,
    };
  });

  // Sort by score descending, return top 15
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
};

module.exports = { findMatches };
