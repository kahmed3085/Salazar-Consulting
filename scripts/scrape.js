// scripts/scrape.js
//
// Fetches active tenders from the PPRA (Pakistan Public Procurement
// Regulatory Authority) active-tenders listing and writes a normalized
// data/tenders.json consumed by the frontend (index.html + script.js).
//
// This portal (https://epms.ppra.gov.pk/public/tenders/active-tenders) is a
// traditional server-rendered page (no separate JSON API was found on the
// network tab), so this scraper parses the rendered HTML with cheerio using
// selectors confirmed against the live markup on 2026-07-15:
//   - td.tender-no                -> tender number
//   - td (3rd column) > div       -> title + category/reference badges
//   - td (4th column)             -> ministry, organization, city - country
//   - .tender-badge                -> status text (Published/Closed/etc.)
//   - 6th/7th columns              -> advertised date, closing date + time
//   - Pagination is via ?page=N ; filters are GET params on the same URL:
//     keyword, tender_no, closing_date, tender_type, procurement_category,
//     sector, tender_nature, organization, country, advertise_date_from,
//     advertise_date_to, status, city
//
// NOTE: tender_type / sector / tender_nature are NOT shown on the listing
// rows themselves (only available on each tender's detail page), so those
// fields are left blank here to keep this a single bulk request per page
// rather than one request per tender.
//
// Re-check these selectors periodically - if PPRA changes their page
// markup, this scraper will need updating to match.

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://epms.ppra.gov.pk/public/tenders/active-tenders';
const OUT_PATH = path.join(__dirname, '..', 'data', 'tenders.json');
const MAX_PAGES = 5;

function toIsoDate(text) {
    const d = new Date(text);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function buildUrl(pageNum) {
    return BASE_URL + '?status=Published&page=' + pageNum;
}

async function fetchPage(pageNum) {
    const url = buildUrl(pageNum);
    const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SalazarConsultingBot/1.0)' },
    });
    if (!res.ok) throw new Error('Request failed with status ' + res.status + ' for page ' + pageNum);
    return res.text();
}

function parsePage(html) {
    const cheerio = require('cheerio');
                             const $ = cheerio.load(html);
    const tenders = [];

  $('td.tender-no').each((i, el) => {
        const tenderNoCell = $(el);
        const tr = tenderNoCell.closest('tr');
        const tds = tr.find('> td');

                             const tenderNo = tenderNoCell.find('strong').text().trim();

                             const detailsTd = $(tds[2]);
        const title = detailsTd.find('> div > strong').first().text().trim();
        const badgeGroup = detailsTd.find('.d-flex.gap-2.flex-wrap.mt-2').first().find('small');
        const category = badgeGroup.eq(0).text().trim();
        const reference = badgeGroup.eq(1).text().trim();

                             const orgTd = $(tds[3]);
        const ministry = orgTd.find('small.text-muted.text-dark').first().text().replace(/\s+/g, ' ').trim();
        const organization = orgTd.find('span.tender-org').text().replace(/\s+/g, ' ').trim();
        const cityCountryRaw = orgTd.find('small.text-muted').last().text().replace(/\s+/g, ' ').trim();
        let city = '';
        let country = 'Pakistan';
        if (cityCountryRaw.indexOf(' - ') !== -1) {
                const parts = cityCountryRaw.split(' - ');
                city = parts[0].trim();
                country = (parts[1] || 'Pakistan').trim();
        }

                             const status = $(tds[4]).find('.tender-badge').text().trim();
        const advertisedDate = toIsoDate($(tds[5]).text().trim());

                             const closingTd = $(tds[6]);
        const closingDate = toIsoDate(closingTd.find('strong').text().trim());
        const closingTime = closingTd.find('small').text().trim();

                             tenders.push({
                                     tenderNo: tenderNo,
                                     title: title,
                                     description: '',
                                     category: category,
                                     reference: reference,
                                     type: '',
                                     sector: '',
                                     nature: '',
                                     ministry: ministry,
                                     organization: organization,
                                     city: city,
                                     country: country,
                                     status: status,
                                     advertisedDate: advertisedDate,
                                     closingDate: closingDate,
                                     closingTime: closingTime,
                             });
  });

  return tenders;
}

async function main() {
    let tenders = [];

  try {
        for (let page = 1; page <= MAX_PAGES; page++) {
                const html = await fetchPage(page);
                const pageTenders = parsePage(html);
                if (pageTenders.length === 0) break;
                tenders = tenders.concat(pageTenders);
        }
        if (tenders.length === 0) throw new Error('No tenders parsed - selectors may be out of date');
  } catch (err) {
        console.error('Scrape failed, keeping existing data:', err.message);
        const existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'));
        tenders = existing.tenders || [];
  }

  const output = {
        generatedAt: new Date().toISOString(),
        tenders: tenders,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
    console.log('Wrote ' + tenders.length + ' tenders to data/tenders.json at ' + output.generatedAt);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
