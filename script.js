const state = {
  all: [],
    filtered: [],
      page: 1,
        pageSize: 10,
        };

        async function loadData() {
          try {
              const res = await fetch('data/tenders.json', { cache: 'no-store' });
                  const json = await res.json();
                      state.all = json.tenders || [];
                          document.getElementById('lastUpdated').textContent =
                                'Last updated: ' + new Date(json.generatedAt).toLocaleString();
                                    populateFilterOptions(state.all);
                                        applyFilters();
                                          } catch (err) {
                                              console.error('Failed to load tenders.json', err);
                                                  document.getElementById('summaryText').textContent = 'Could not load tender data.';
                                                    }
                                                    }

                                                    function populateFilterOptions(data) {
                                                      fillSelect('fType', unique(data.map(t => t.type)));
                                                        fillSelect('fCategory', unique(data.map(t => t.category)));
                                                          fillSelect('fSector', unique(data.map(t => t.sector)));
                                                            fillSelect('fOrg', unique(data.map(t => t.organization)));
                                                            }

                                                            function unique(arr) {
                                                              return [...new Set(arr.filter(Boolean))].sort();
                                                              }

                                                              function fillSelect(id, values) {
                                                                const el = document.getElementById(id);
                                                                  const current = el.value;
                                                                    const firstOption = el.querySelector('option');
                                                                      el.innerHTML = '';
                                                                        el.appendChild(firstOption);
                                                                          values.forEach(v => {
                                                                              const opt = document.createElement('option');
                                                                                  opt.value = v;
                                                                                      opt.textContent = v;
                                                                                          el.appendChild(opt);
                                                                                            });
                                                                                              el.value = current;
                                                                                              }

                                                                                              function applyFilters() {
                                                                                                const keyword = document.getElementById('fKeyword').value.trim().toLowerCase();
                                                                                                  const tenderNo = document.getElementById('fTenderNo').value.trim().toLowerCase();
                                                                                                    const closingDate = document.getElementById('fClosingDate').value;
                                                                                                      const type = document.getElementById('fType').value;
                                                                                                        const category = document.getElementById('fCategory').value;
                                                                                                          const sector = document.getElementById('fSector').value;
                                                                                                            const nature = document.getElementById('fNature').value;
                                                                                                              const org = document.getElementById('fOrg').value;
                                                                                                                const dateFrom = document.getElementById('fDateFrom').value;
                                                                                                                  const dateTo = document.getElementById('fDateTo').value;
                                                                                                                    const status = document.getElementById('fStatus').value;
                                                                                                                      const city = document.getElementById('fCity').value.trim().toLowerCase();
                                                                                                                      
                                                                                                                        state.filtered = state.all.filter(t => {
                                                                                                                            if (keyword && !((t.title + ' ' + t.description + ' ' + t.tenderNo).toLowerCase().includes(keyword))) return false;
                                                                                                                                if (tenderNo && !t.tenderNo.toLowerCase().includes(tenderNo)) return false;
                                                                                                                                    if (closingDate && t.closingDate !== closingDate) return false;
                                                                                                                                        if (type && t.type !== type) return false;
                                                                                                                                            if (category && t.category !== category) return false;
                                                                                                                                                if (sector && t.sector !== sector) return false;
                                                                                                                                                    if (nature && t.nature !== nature) return false;
                                                                                                                                                        if (org && t.organization !== org) return false;
                                                                                                                                                            if (status && t.status !== status) return false;
                                                                                                                                                                if (city && !(t.city || '').toLowerCase().includes(city)) return false;
                                                                                                                                                                    if (dateFrom && t.advertisedDate < dateFrom) return false;
                                                                                                                                                                        if (dateTo && t.advertisedDate > dateTo) return false;
                                                                                                                                                                            return true;
                                                                                                                                                                              });
                                                                                                                                                                              
                                                                                                                                                                                state.page = 1;
                                                                                                                                                                                  render();
                                                                                                                                                                                  }
                                                                                                                                                                                  
                                                                                                                                                                                  function resetFilters() {
                                                                                                                                                                                    document.querySelectorAll('.filters-grid input').forEach(i => i.value = '');
                                                                                                                                                                                      document.querySelectorAll('.filters-grid select').forEach(s => s.value = '');
                                                                                                                                                                                        applyFilters();
                                                                                                                                                                                        }
                                                                                                                                                                                        
                                                                                                                                                                                        function badgeClass(status) {
                                                                                                                                                                                          if (status === 'Published') return 'badge badge-published';
                                                                                                                                                                                            if (status === 'Corrigendum') return 'badge badge-corrigendum';
                                                                                                                                                                                              return 'badge badge-closed';
                                                                                                                                                                                              }
                                                                                                                                                                                              
                                                                                                                                                                                              function render() {
                                                                                                                                                                                                const body = document.getElementById('tendersBody');
                                                                                                                                                                                                  body.innerHTML = '';
                                                                                                                                                                                                    const start = (state.page - 1) * state.pageSize;
                                                                                                                                                                                                      const pageItems = state.filtered.slice(start, start + state.pageSize);
                                                                                                                                                                                                      
                                                                                                                                                                                                        pageItems.forEach((t, idx) => {
                                                                                                                                                                                                            const tr = document.createElement('tr');
                                                                                                                                                                                                                tr.innerHTML =
                                                                                                                                                                                                                      '<td>' + (start + idx + 1) + '</td>' +
                                                                                                                                                                                                                            '<td><strong>' + t.tenderNo + '</strong></td>' +
                                                                                                                                                                                                                                  '<td><p class="tender-title">' + t.title + '</p>' +
                                                                                                                                                                                                                                        '<div class="tender-tags"><span>' + (t.category || '') + '</span><span>' + (t.reference || '') + '</span></div></td>' +
                                                                                                                                                                                                                                              '<td><div class="org-line">' + (t.ministry || '') + '</div>' +
                                                                                                                                                                                                                                                    '<div class="org-line">' + (t.organization || '') + '</div>' +
                                                                                                                                                                                                                                                          '<div class="org-line">' + (t.city || '') + ' - ' + (t.country || '') + '</div></td>' +
                                                                                                                                                                                                                                                                '<td><span class="' + badgeClass(t.status) + '">' + t.status + '</span></td>' +
                                                                                                                                                                                                                                                                      '<td>' + (t.advertisedDate || '') + '</td>' +
                                                                                                                                                                                                                                                                            '<td>' + (t.closingDate || '') + '<br>' + (t.closingTime || '') + '</td>' +
                                                                                                                                                                                                                                                                                  '<td class="actions-cell"><button class="icon-btn" title="View details">\u{1F441}</button>' +
                                                                                                                                                                                                                                                                                        '<button class="icon-btn" title="View document">\u{1F4C4}</button></td>';
                                                                                                                                                                                                                                                                                            body.appendChild(tr);
                                                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                document.getElementById('summaryText').textContent =
                                                                                                                                                                                                                                                                                                    'Showing ' + pageItems.length + ' of ' + state.filtered.length + ' tenders';
                                                                                                                                                                                                                                                                                                      const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
                                                                                                                                                                                                                                                                                                        document.getElementById('pageText').textContent = 'Page ' + state.page + ' of ' + totalPages;
                                                                                                                                                                                                                                                                                                          renderPagination(totalPages);
                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                          function renderPagination(totalPages) {
                                                                                                                                                                                                                                                                                                            const el = document.getElementById('pagination');
                                                                                                                                                                                                                                                                                                              el.innerHTML = '';
                                                                                                                                                                                                                                                                                                                for (let p = 1; p <= totalPages; p++) {
                                                                                                                                                                                                                                                                                                                    const btn = document.createElement('button');
                                                                                                                                                                                                                                                                                                                        btn.textContent = p;
                                                                                                                                                                                                                                                                                                                            if (p === state.page) btn.classList.add('active');
                                                                                                                                                                                                                                                                                                                                btn.addEventListener('click', () => { state.page = p; render(); });
                                                                                                                                                                                                                                                                                                                                    el.appendChild(btn);
                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                      document.getElementById('applyBtn').addEventListener('click', applyFilters);
                                                                                                                                                                                                                                                                                                                                      document.getElementById('resetBtn').addEventListener('click', resetFilters);
                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                      loadData();
                                                                                                                                                                                                                                                                                                                                      
