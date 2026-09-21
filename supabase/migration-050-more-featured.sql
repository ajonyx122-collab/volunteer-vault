-- Migration 050: mark ~30 well-known national organizations as featured, so the
-- home page's daily-rotating "Featured" section has a big enough pool to show a
-- genuinely fresh set every day (it was only 6 before). Idempotent — just flips
-- a boolean on existing rows; names that don't exist are simply skipped.
update public.organizations set featured = true
where name in (
  'American Red Cross', 'Feeding America', 'Habitat for Humanity', 'Zooniverse',
  'Smithsonian Transcription Center', 'Meals on Wheels America', 'Best Buddies International',
  'UPchieve', 'Learn To Be', 'Crisis Text Line', 'Be My Eyes', 'Translators without Borders',
  'UN Online Volunteering', 'The Trevor Project', 'Ronald McDonald House Charities',
  'Special Olympics', 'Humane Society of the United States', 'National Park Service',
  'Operation Gratitude', 'DoSomething.org', 'Girls on the Run', 'iNaturalist', 'Tarjimly',
  'Idealist', 'Points of Light', 'JustServe', 'Kiva', 'Khan Academy', 'Catchafire', '7 Cups'
);
