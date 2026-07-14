// scripts/scrape.js
//
// Fetches active tenders from PPRA (Pakistan Public Procurement Regulatory
// Authority) and writes a normalized data/tenders.json consumed by the
// frontend (index.html + script.js).
//
// IMPORTANT: This portal (https://epms.ppra.gov.pk/public/tenders/active-tenders)
// renders its tender list via client-side JavaScript. Before relying on this
// script, open that page in your browser, open DevTools > Network > Fetch/XHR,
// and look for the JSON API request it makes to load tenders (it will be far
// more reliable than parsing rendered HTML, which can change at any time).
// Replace API_URL below with that endpoint once you've identified it, and
// adjust the field mapping in mapTender() to match the real response shape.
//
// Also check the site's Terms of Use / robots.txt before scheduling automated
// requests, and keep the request frequency reasonable (this workflow runs once
// per day).

const fs = require('fs');
const path = require('path');

const API_URL = 'https://epms.ppra.gov.pk/REPLACE/WITH/REAL/API/ENDPOINT';
const OUT_PATH = path.join(__dirname, '..', 'data', 'tenders.json');

function mapTender(item) {
  return {
      tenderNo: item.tenderNumber || item.tenderNo || '',
          title: item.title || '',
              description: item.description || '',
                  category: item.category || '',
                      reference: item.referenceNo || item.reference || '',
                          type: item.tenderType || item.type || '',
                              sector: item.sector || '',
                                  nature: item.nature || '',
                                      ministry: item.ministryName || item.ministry || '',
                                          organization: item.organizationName || item.organization || '',
                                              city: item.city || '',
                                                  country: item.country || 'Pakistan',
                                                      status: item.status || '',
                                                          advertisedDate: item.advertisedDate || '',
                                                              closingDate: item.closingDate || '',
                                                                  closingTime: item.closingTime || '',
                                                                    };
                                                                    }

                                                                    async function main() {
                                                                      let tenders;

                                                                        try {
                                                                            const res = await fetch(API_URL);
                                                                                if (!res.ok) throw new Error('Request failed with status ' + res.status);
                                                                                    const json = await res.json();
                                                                                        const rawList = json.data || json.tenders || json.items || [];
                                                                                            tenders = rawList.map(mapTender);
                                                                                              } catch (err) {
                                                                                                  console.error('Scrape failed, keeping existing data:', err.message);
                                                                                                      const existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'));
                                                                                                          tenders = existing.tenders || [];
                                                                                                            }
                                                                                                            
                                                                                                              const output = {
                                                                                                                  generatedAt: new Date().toISOString(),
                                                                                                                      tenders,
                                                                                                                        };
                                                                                                                        
                                                                                                                          fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
                                                                                                                            console.log('Wrote ' + tenders.length + ' tenders to data/tenders.json at ' + output.generatedAt);
                                                                                                                            }
                                                                                                                            
                                                                                                                            main().catch(err => {
                                                                                                                              console.error(err);
                                                                                                                                process.exit(1);
                                                                                                                                });
                                                                                                                                
