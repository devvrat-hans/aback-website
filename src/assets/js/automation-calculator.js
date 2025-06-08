// Automation Calculator JavaScript

class AutomationCalculator {
  constructor() {
    this.industryPresets = {
      finance: {
        tasksPerPeriod: 150,
        timePerTask: 20,
        hourlyRate: 65,
        employeesAffected: 8,
        errorRate: 8,
        automationEfficiency: 90,
        implementationCost: 3500
      },
      healthcare: {
        tasksPerPeriod: 200,
        timePerTask: 15,
        hourlyRate: 55,
        employeesAffected: 12,
        errorRate: 12,
        automationEfficiency: 85,
        implementationCost: 4500
      },
      manufacturing: {
        tasksPerPeriod: 300,
        timePerTask: 25,
        hourlyRate: 45,
        employeesAffected: 15,
        errorRate: 15,
        automationEfficiency: 95,
        implementationCost: 5500
      },
      retail: {
        tasksPerPeriod: 100,
        timePerTask: 10,
        hourlyRate: 25,
        employeesAffected: 6,
        errorRate: 10,
        automationEfficiency: 80,
        implementationCost: 2500
      },
      insurance: {
        tasksPerPeriod: 120,
        timePerTask: 30,
        hourlyRate: 60,
        employeesAffected: 10,
        errorRate: 15,
        automationEfficiency: 88,
        implementationCost: 4000
      },
      legal: {
        tasksPerPeriod: 80,
        timePerTask: 45,
        hourlyRate: 125,
        employeesAffected: 4,
        errorRate: 5,
        automationEfficiency: 75,
        implementationCost: 6000
      },
      hr: {
        tasksPerPeriod: 180,
        timePerTask: 18,
        hourlyRate: 55,
        employeesAffected: 7,
        errorRate: 12,
        automationEfficiency: 85,
        implementationCost: 3000
      },
      logistics: {
        tasksPerPeriod: 250,
        timePerTask: 12,
        hourlyRate: 35,
        employeesAffected: 20,
        errorRate: 18,
        automationEfficiency: 92,
        implementationCost: 5000
      }
    };

    this.automationPresets = {
      conservative: {
        automationEfficiency: 70,
        errorReduction: 80,
        implementationMultiplier: 1.2
      },
      moderate: {
        automationEfficiency: 85,
        errorReduction: 90,
        implementationMultiplier: 1.0
      },
      aggressive: {
        automationEfficiency: 95,
        errorReduction: 95,
        implementationMultiplier: 0.8
      }
    };

    this.scenarios = [
      {
        name: "Conservative",
        subtitle: "70% automation",
        data: {},
        results: {}
      }
    ];
    this.currentScenario = 0;
    this.isComparing = false;
    
    this.init();
  }

  init() {
    this.setupDebouncedCalculate();
    this.bindEvents();
    this.setupSliders();
    // Ensure we have default values before calculating
    this.setDefaultValues();
    this.calculate();
    this.updateProgressIndicators();
    this.initEnhancements();
  }

  setDefaultValues() {
    // Ensure all required inputs have default values
    const defaults = {
      'tasks-per-period': 50,
      'time-per-task': 15,
      'hourly-rate': 35,
      'employees-affected': 5,
      'error-rate': 5,
      'automation-efficiency': 85,
      'implementation-cost': 0
    };

    Object.entries(defaults).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) {
        if (!input.value || input.value === '0' || input.value === '') {
          input.value = value;
          // Try to sync slider safely
          try {
            this.syncSlider(id);
          } catch (e) {
            console.warn(`Could not sync slider for ${id}:`, e.message);
          }
        }
      } else {
        console.warn(`Element with id '${id}' not found in DOM`);
      }
    });
  }

  bindEvents() {
    // Industry preset change
    document.getElementById('industry-preset').addEventListener('change', (e) => {
      this.applyIndustryPreset(e.target.value);
    });

    // Cost method toggle
    document.querySelectorAll('input[name="cost-method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.toggleCostMethod(e.target.value);
      });
    });

    // Job role selection
    document.getElementById('job-role').addEventListener('change', (e) => {
      if (e.target.value) {
        document.getElementById('hourly-rate').value = e.target.value;
        this.updateSlider('cost-slider', e.target.value);
        this.calculate();
      }
    });

    // Advanced options toggle
    document.getElementById('toggle-advanced').addEventListener('click', (e) => {
      this.toggleAdvancedOptions(e.target);
    });

    // Transparency toggle
    document.getElementById('show-calculations').addEventListener('click', (e) => {
      this.toggleTransparency(e.target);
    });

    // Input changes
    const inputs = [
      'tasks-per-period', 'time-per-task', 'hourly-rate', 'employees-affected',
      'error-rate', 'automation-efficiency', 'implementation-cost'
    ];
    
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          this.syncSlider(id);
          this.debouncedCalculate();
        });
      }
    });

    // Unit changes
    ['task-frequency', 'time-unit'].forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.addEventListener('change', () => this.performCalculation());
      }
    });

    // Action buttons
    document.getElementById('get-consultation').addEventListener('click', () => {
      this.handleConsultation();
    });

    document.getElementById('download-report').addEventListener('click', () => {
      this.downloadReport();
    });

    document.getElementById('download-pdf-report').addEventListener('click', () => {
      this.downloadPDFReport();
    });

    document.getElementById('share-results').addEventListener('click', () => {
      this.shareResults();
    });

    document.getElementById('add-scenario').addEventListener('click', () => {
      this.addScenario();
    });

    // Scenario management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('scenario-tab')) {
        this.switchScenario(parseInt(e.target.dataset.scenario));
      }
      if (e.target.classList.contains('preset-btn')) {
        this.applyAutomationPreset(e.target.dataset.preset);
      }
    });

    // Compare toggle
    const compareToggle = document.getElementById('compare-toggle');
    if (compareToggle) {
      compareToggle.addEventListener('click', () => {
        this.toggleComparison();
      });
    }

    // Reset scenarios
    const resetBtn = document.getElementById('reset-scenarios');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetScenarios();
      });
    }
  }

  setupSliders() {
    const sliderMappings = {
      'tasks-slider': 'tasks-per-period',
      'time-slider': 'time-per-task',
      'cost-slider': 'hourly-rate',
      'employees-slider': 'employees-affected',
      'error-slider': 'error-rate',
      'efficiency-slider': 'automation-efficiency'
    };

    Object.entries(sliderMappings).forEach(([sliderId, inputId]) => {
      const slider = document.getElementById(sliderId);
      const input = document.getElementById(inputId);
      
      if (slider && input) {
        slider.addEventListener('input', (e) => {
          input.value = e.target.value;
          this.calculate();
        });
      }
    });
  }

  syncSlider(inputId) {
    const sliderMappings = {
      'tasks-per-period': 'tasks-slider',
      'time-per-task': 'time-slider',
      'hourly-rate': 'cost-slider',
      'employees-affected': 'employees-slider',
      'error-rate': 'error-slider',
      'automation-efficiency': 'efficiency-slider'
    };

    const sliderId = sliderMappings[inputId];
    if (sliderId) {
      const slider = document.getElementById(sliderId);
      const input = document.getElementById(inputId);
      if (slider && input) {
        const value = Math.min(Math.max(input.value, slider.min), slider.max);
        slider.value = value;
      }
    }
  }

  updateSlider(sliderId, value) {
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.value = Math.min(Math.max(value, slider.min), slider.max);
    }
  }

  applyIndustryPreset(industry) {
    if (!industry || !this.industryPresets[industry]) return;

    const preset = this.industryPresets[industry];
    
    // Apply preset values
    document.getElementById('tasks-per-period').value = preset.tasksPerPeriod;
    document.getElementById('time-per-task').value = preset.timePerTask;
    document.getElementById('hourly-rate').value = preset.hourlyRate;
    document.getElementById('employees-affected').value = preset.employeesAffected;
    document.getElementById('error-rate').value = preset.errorRate;
    document.getElementById('automation-efficiency').value = preset.automationEfficiency;
    document.getElementById('implementation-cost').value = preset.implementationCost;

    // Update sliders
    this.syncSlider('tasks-per-period');
    this.syncSlider('time-per-task');
    this.syncSlider('hourly-rate');
    this.syncSlider('employees-affected');
    this.syncSlider('error-rate');
    this.syncSlider('automation-efficiency');

    // Show advanced options if not already shown
    const advancedContent = document.getElementById('advanced-content');
    if (advancedContent.style.display === 'none') {
      this.toggleAdvancedOptions(document.getElementById('toggle-advanced'));
    }

    this.calculate();
  }

  toggleCostMethod(method) {
    const directInput = document.getElementById('direct-cost-input');
    const roleInput = document.getElementById('role-cost-input');

    if (method === 'direct') {
      directInput.style.display = 'block';
      roleInput.style.display = 'none';
    } else {
      directInput.style.display = 'none';
      roleInput.style.display = 'block';
    }
  }

  toggleAdvancedOptions(button) {
    const content = document.getElementById('advanced-content');
    const isOpen = content.style.display !== 'none';
    
    content.style.display = isOpen ? 'none' : 'block';
    button.classList.toggle('active', !isOpen);
  }

  toggleTransparency(button) {
    const content = document.getElementById('calculation-details');
    const isOpen = content.style.display !== 'none';
    
    content.style.display = isOpen ? 'none' : 'block';
    button.classList.toggle('active', !isOpen);
  }

  getInputValues() {
    // Check if elements exist before accessing them
    const taskFrequencyEl = document.getElementById('task-frequency');
    const timeUnitEl = document.getElementById('time-unit');
    const tasksPerPeriodEl = document.getElementById('tasks-per-period');
    const timePerTaskEl = document.getElementById('time-per-task');
    const hourlyRateEl = document.getElementById('hourly-rate');
    const employeesAffectedEl = document.getElementById('employees-affected');
    const errorRateEl = document.getElementById('error-rate');
    const automationEfficiencyEl = document.getElementById('automation-efficiency');
    const implementationCostEl = document.getElementById('implementation-cost');
    
    if (!taskFrequencyEl || !timeUnitEl || !tasksPerPeriodEl || !timePerTaskEl || !hourlyRateEl || !employeesAffectedEl) {
      console.error('Required DOM elements not found');
      console.error('Missing elements:', {
        taskFrequency: !taskFrequencyEl,
        timeUnit: !timeUnitEl,
        tasksPerPeriod: !tasksPerPeriodEl,
        timePerTask: !timePerTaskEl,
        hourlyRate: !hourlyRateEl,
        employeesAffected: !employeesAffectedEl
      });
      return {
        tasksPerPeriod: 0,
        tasksPerMonth: 0,
        timePerTask: 0,
        timePerTaskMinutes: 0,
        timeUnit: 'minutes',
        taskFrequency: 'monthly',
        hourlyRate: 0,
        employeesAffected: 0,
        errorRate: 0,
        automationEfficiency: 85,
        implementationCost: 0
      };
    }
    
    const taskFrequency = taskFrequencyEl.value;
    const timeUnit = timeUnitEl.value;
    
    let tasksPerPeriod = parseInt(tasksPerPeriodEl.value) || 0;
    let timePerTask = parseFloat(timePerTaskEl.value) || 0;
    
    // Convert to monthly tasks
    let tasksPerMonth = tasksPerPeriod;
    if (taskFrequency === 'daily') {
      tasksPerMonth *= 22; // 22 working days per month
    } else if (taskFrequency === 'weekly') {
      tasksPerMonth *= 4.33; // ~4.33 weeks per month
    }
    
    // Convert to minutes for internal calculations
    let timePerTaskMinutes = timePerTask;
    if (timeUnit === 'hours') {
      timePerTaskMinutes *= 60;
    }

    const finalValues = {
      tasksPerPeriod: tasksPerPeriod,
      tasksPerMonth: tasksPerMonth,
      timePerTask: timePerTask,
      timePerTaskMinutes: timePerTaskMinutes,
      timeUnit: timeUnit,
      taskFrequency: taskFrequency,
      hourlyRate: parseFloat(hourlyRateEl.value) || 0,
      employeesAffected: parseInt(employeesAffectedEl.value) || 0,
      errorRate: parseFloat(errorRateEl ? errorRateEl.value : 0) || 0,
      automationEfficiency: parseFloat(automationEfficiencyEl ? automationEfficiencyEl.value : 85) || 85,
      implementationCost: parseFloat(implementationCostEl ? implementationCostEl.value : 0) || 0
    };
    
    return finalValues;
  }

  calculate() {
    try {
      // Use validation before calculating
      this.calculateWithValidation();
    } catch (error) {
      console.error('Error in calculate method:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // Original calculate method renamed for internal use
  performCalculation() {
    const inputs = this.getInputValues();
    
    // Check if we have minimum required inputs
    if (inputs.tasksPerMonth <= 0 || inputs.timePerTaskMinutes <= 0 || inputs.hourlyRate <= 0 || inputs.employeesAffected <= 0) {
      this.displayResults({});
      this.updateProgressIndicators();
      return;
    }

    // Use the enhanced calculation method
    const results = this.calculateResults();
    
    // Store results in current scenario
    this.scenarios[this.currentScenario].results = results;
    
    // Display results
    this.displayResults(results);
    this.updateProgressIndicators();
  }

  displayResults(results) {
    if (!results || Object.keys(results).length === 0 || !results.totalAnnualBenefit) {
      // Show empty state
      const elements = [
        'annual-savings', 'monthly-savings', 'time-saved-annually', 
        'time-saved-weekly', 'productivity-increase', 'tasks-automated-annually',
        'roi-percentage', 'breakeven-time'
      ];
      
      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          if (id === 'annual-savings') element.textContent = '$0';
          else if (id === 'monthly-savings') element.textContent = '$0/month';
          else if (id === 'time-saved-annually') element.textContent = '0';
          else if (id === 'time-saved-weekly') element.textContent = '0 hrs/week';
          else if (id === 'productivity-increase') element.textContent = '0%';
          else if (id === 'tasks-automated-annually') element.textContent = '0 tasks/year';
          else if (id === 'roi-percentage') element.textContent = '0%';
          else if (id === 'breakeven-time') element.textContent = 'Breakeven in 0 months';
        } else {
          console.warn(`Element with id '${id}' not found`);
        }
      });
      return;
    }

    // Key metrics
    const annualElement = document.getElementById('annual-savings');
    if (annualElement) {
      const formattedValue = this.formatCurrency(results.totalAnnualBenefit);
      annualElement.textContent = formattedValue;
    } else {
      console.warn('annual-savings element not found');
    }
    
    const monthlyElement = document.getElementById('monthly-savings');
    if (monthlyElement) {
      const formattedValue = `${this.formatCurrency(results.monthlySavings)}/month`;
      monthlyElement.textContent = formattedValue;
    }
    
    const timeAnnuallyElement = document.getElementById('time-saved-annually');
    if (timeAnnuallyElement) {
      const value = this.formatNumber(Math.round(results.timesSavedAnnually));
      timeAnnuallyElement.textContent = value;
    }
    
    const timeWeeklyElement = document.getElementById('time-saved-weekly');
    if (timeWeeklyElement) {
      const value = `${Math.round(results.timesSavedWeekly)} hrs/week`;
      timeWeeklyElement.textContent = value;
    }
    
    // Enhanced context - Full-time equivalent calculation
    const timeContext = document.getElementById('time-context');
    if (timeContext && results.timesSavedAnnually) {
      const fulltimeEquivalent = Math.round(results.timesSavedAnnually / 2000 * 10) / 10;
      timeContext.textContent = `Equivalent to ${fulltimeEquivalent} full-time employee${fulltimeEquivalent !== 1 ? 's' : ''}`;
    }
    
    // Productivity context
    const productivityContext = document.getElementById('productivity-context');
    if (productivityContext && results.timesSavedWeekly) {
      const savedHours = Math.round(results.timesSavedWeekly);
      productivityContext.textContent = `${savedHours} hours/week for strategic work`;
    }
    
    const productivityElement = document.getElementById('productivity-increase');
    if (productivityElement) {
      const value = `${Math.round(results.productivityIncrease)}%`;
      productivityElement.textContent = value;
    }
    
    const tasksElement = document.getElementById('tasks-automated-annually');
    if (tasksElement) {
      const value = `${this.formatNumber(results.tasksAutomatedAnnually)} tasks/year`;
      tasksElement.textContent = value;
    }
    
    const roiElement = document.getElementById('roi-percentage');
    if (roiElement) {
      const value = `${Math.round(results.roiPercentage)}%`;
      roiElement.textContent = value;
    }
    
    const breakevenElement = document.getElementById('breakeven-time');
    if (breakevenElement) {
      const value = results.breakevenMonths > 0 ? 
        `Breakeven in ${results.breakevenMonths} months` : 'Immediate ROI';
      breakevenElement.textContent = value;
    }

    // Detailed breakdown
    const timePerTaskElement = document.getElementById('time-per-task-saved');
    if (timePerTaskElement) {
      timePerTaskElement.textContent = `${Math.round(results.timesSavedAnnually / results.tasksAutomatedAnnually * 60)} minutes`;
    }
    
    const dailyTimeElement = document.getElementById('daily-time-saved');
    if (dailyTimeElement) {
      dailyTimeElement.textContent = `${Math.round(results.timesSavedWeekly / 5)} hours`;
    }
    
    const weeklyTimeElement = document.getElementById('weekly-time-saved');
    if (weeklyTimeElement) {
      weeklyTimeElement.textContent = `${Math.round(results.timesSavedWeekly)} hours`;
    }
    
    const laborSavingsElement = document.getElementById('labor-savings');
    if (laborSavingsElement) {
      laborSavingsElement.textContent = this.formatCurrency(results.laborSavings);
    }
    
    const netBenefitElement = document.getElementById('net-savings-year1');
    if (netBenefitElement) {
      netBenefitElement.textContent = this.formatCurrency(results.netBenefit);
    }

    // Error reduction section
    const qualityImpactElement = document.getElementById('quality-impact');
    if (results.currentErrorsAnnually > 0) {
      if (qualityImpactElement) {
        qualityImpactElement.style.display = 'block';
      }
      
      const currentErrorsElement = document.getElementById('current-errors');
      if (currentErrorsElement) {
        currentErrorsElement.textContent = Math.round(results.currentErrorsAnnually);
      }
      
      const errorsAfterElement = document.getElementById('errors-after-automation');
      if (errorsAfterElement) {
        errorsAfterElement.textContent = Math.round(results.errorsAfterAutomation);
      }
      
      const errorReductionElement = document.getElementById('error-reduction-percent');
      if (errorReductionElement) {
        errorReductionElement.textContent = `${Math.round(results.errorReductionPercent)}%`;
      }
    } else {
      if (qualityImpactElement) {
        qualityImpactElement.style.display = 'none';
      }
    }

    // Implementation cost
    const implementationCostElement = document.getElementById('implementation-cost-display');
    if (implementationCostElement && results.implementationCost > 0) {
      implementationCostElement.textContent = this.formatCurrency(results.implementationCost);
    }

    // Update trends and confidence indicators
    this.updateTrendIndicators(results);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  handleConsultation() {
    // Track engagement
    if (typeof gtag !== 'undefined') {
      gtag('event', 'calculator_consultation_request', {
        event_category: 'engagement',
        event_label: 'automation_calculator'
      });
    }

    // Redirect to contact page with calculator context
    const params = new URLSearchParams({
      source: 'automation_calculator',
      annual_savings: document.getElementById('annual-savings').textContent,
      roi: document.getElementById('roi-percentage').textContent
    });
    
    window.location.href = `/contact?${params.toString()}`;
  }

  downloadReport() {
    // Generate comprehensive HTML report
    const results = this.getDisplayedResults();
    
    // Generate HTML content
    const htmlContent = this.generateReportHTML(results);
    
    // Create downloadable blob
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    link.download = `automation-assessment-report-${dateString}.html`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  downloadPDFReport() {
    try {
      // Check if jsPDF is available
      if (!window.jspdf) {
        this.showNotification('PDF library not loaded. Please refresh the page and try again.', 'error');
        return;
      }

      // Show loading notification
      this.showNotification('Generating PDF report...', 'info');
      
      // Disable the button temporarily to prevent multiple clicks
      const pdfButton = document.getElementById('download-pdf-report');
      if (pdfButton) {
        pdfButton.disabled = true;
        pdfButton.textContent = 'Generating...';
      }

      // Use setTimeout to allow the UI to update before starting PDF generation
      setTimeout(() => {
        try {
          const results = this.getDisplayedResults();
          const inputs = this.getInputValues();
          const reportMetrics = this.calculateResults();
          const comprehensiveData = this.generateComprehensiveAnalysis(reportMetrics, inputs);
          
          // Call the PDF generation method
          this.generatePDFReport(results, inputs, reportMetrics, comprehensiveData);
          
          // Show success notification
          this.showNotification('PDF report generated successfully!', 'success');
        } catch (error) {
          console.error('Error generating PDF report:', error);
          this.showNotification('Error generating PDF report. Please try again.', 'error');
        } finally {
          // Re-enable the button
          if (pdfButton) {
            pdfButton.disabled = false;
            pdfButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 3h12v10H2zM6 7h4M6 9h4M6 11h2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              Download PDF Report
            `;
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing PDF report generation:', error);
      this.showNotification('Error generating PDF report. Please try again.', 'error');
    }
  }

  generatePDFReport(results, inputs, reportMetrics, comprehensiveData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let yPosition = 20;
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add centered text
    const addCenteredText = (text, fontSize, fontStyle = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, yPosition);
      yPosition += fontSize * 0.5;
    };

    // Helper function to add section header
    const addSectionHeader = (title, subtitle = '') => {
      checkPageBreak(30);
      yPosition += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text(title, margin, yPosition);
      yPosition += 8;
      
      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, margin, yPosition);
        yPosition += 6;
      }
      
      // Add underline
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
    };

    // Helper function to add key-value pair
    const addKeyValue = (key, value, bold = false) => {
      checkPageBreak(8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(key + ':', margin, yPosition);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(value.toString(), margin + 60, yPosition);
      yPosition += 6;
    };

    // Helper function to add text paragraph
    const addParagraph = (text, fontSize = 10) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(text, contentWidth);
      checkPageBreak(splitText.length * 5 + 5);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 5 + 10;
    };

    // Title Page
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    doc.setTextColor(255, 255, 255);
    yPosition = 30;
    addCenteredText('COMPREHENSIVE AUTOMATION', 20, 'bold');
    addCenteredText('ASSESSMENT REPORT', 20, 'bold');
    yPosition += 10;
    addCenteredText('AI-Powered Business Process Analysis', 12, 'normal');
    
    yPosition = 90;
    doc.setTextColor(0, 0, 0);
    
    // Report metadata
    doc.setFillColor(248, 249, 255);
    doc.rect(margin, yPosition, contentWidth, 50, 'F');
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Details', margin + 5, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${formattedDate}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Industry: ${inputs.industry || 'Custom'}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Analysis Scope: Comprehensive Business Process Assessment`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Report Type: ROI & Implementation Analysis`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Company: ${inputs.companyName || 'Your Organization'}`, margin + 5, yPosition);

    // Executive Summary
    doc.addPage();
    yPosition = margin;
    addSectionHeader('EXECUTIVE SUMMARY', 'Key Findings and Recommendations');
    
    // Add executive summary content
    const executiveSummary = `This comprehensive automation assessment reveals significant opportunities for process optimization and cost reduction. Through strategic implementation of AI-powered automation solutions, your organization can achieve substantial operational improvements while maintaining quality standards and enhancing employee satisfaction.`;
    addParagraph(executiveSummary);

    // Key metrics in a grid
    const metrics = [
      { label: 'Annual Savings', value: results.annualSavings, type: 'currency' },
      { label: 'ROI', value: results.roi, type: 'percentage' },
      { label: 'Monthly Savings', value: results.monthlySavings, type: 'currency' },
      { label: 'Hours Saved/Month', value: results.hoursSavedPerMonth || 'N/A', type: 'hours' },
      { label: 'Productivity Increase', value: results.productivityIncrease, type: 'percentage' },
      { label: 'Time Saved Annually', value: results.timeSaved, type: 'time' }
    ];
    
    doc.setFillColor(230, 240, 255);
    doc.rect(margin, yPosition, contentWidth, 70, 'F');
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', margin + 5, yPosition);
    yPosition += 12;
    
    metrics.forEach((metric, index) => {
      const x = margin + 5 + (index % 2) * (contentWidth / 2);
      const y = yPosition + Math.floor(index / 2) * 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label + ':', x, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      let displayValue = metric.value || 'N/A';
      
      doc.text(displayValue.toString(), x + 40, y);
      doc.setTextColor(0, 0, 0);
    });
    
    yPosition += 60;
    
    // Current State Analysis
    addSectionHeader('CURRENT STATE ANALYSIS', 'Baseline Operations Assessment');
    
    addParagraph('Your current operational baseline provides the foundation for our automation recommendations. The following metrics represent your existing process efficiency and associated costs:');
    
    addKeyValue('Tasks per Period', (inputs.tasksPerPeriod || 0) + ' tasks');
    addKeyValue('Time per Task', (inputs.timePerTask || 0) + ' minutes');
    addKeyValue('Hourly Rate', '$' + (inputs.hourlyRate || 0));
    addKeyValue('Employees Affected', (inputs.employeesAffected || 1) + ' employees');
    addKeyValue('Current Error Rate', (inputs.errorRate || 0) + '%');
    addKeyValue('Monthly Labor Cost', results.monthlyLaborCost || '$0');
    addKeyValue('Annual Operational Cost', results.annualLaborCost || '$0');
    
    yPosition += 10;
    
    // Automation Strategy
    addSectionHeader('AUTOMATION STRATEGY', 'Recommended Approach and Technology Stack');
    
    const automationText = `Based on your current operations, we recommend implementing a ${inputs.automationEfficiency || 70}% automation solution. This approach will optimize ${comprehensiveData.processesAffected || 'multiple'} key processes while maintaining quality standards and ensuring seamless integration with existing systems.

Our recommended strategy focuses on:
• Process digitization and standardization
• Intelligent workflow automation
• Error reduction through AI validation
• Scalable integration architecture
• Comprehensive employee training and change management`;
    
    addParagraph(automationText);
    
    addKeyValue('Automation Efficiency Target', (inputs.automationEfficiency || 70) + '%');
    addKeyValue('Implementation Timeline', '3-6 months');
    addKeyValue('Technology Stack', 'AI/ML + RPA + Custom APIs');
    addKeyValue('Integration Complexity', 'Medium');
    addKeyValue('Expected ROI Timeline', '6-12 months');

    // Financial Impact Analysis
    checkPageBreak(80);
    addSectionHeader('FINANCIAL IMPACT ANALYSIS', '5-Year Financial Projection');
    
    addParagraph('The financial analysis demonstrates compelling returns on automation investment, with benefits extending beyond immediate cost savings to include improved accuracy, faster processing, and enhanced scalability.');
    
    addKeyValue('Initial Investment', '$' + (inputs.implementationCost || 0).toLocaleString(), true);
    addKeyValue('Monthly Savings', results.monthlySavings, true);
    addKeyValue('Annual Savings', results.annualSavings, true);
    
    // Parse annual savings for calculations (remove currency symbols and parse as number)
    const annualSavingsNumber = parseFloat(results.annualSavings.replace(/[$,]/g, '')) || 0;
    const paybackMonths = inputs.implementationCost ? Math.ceil(inputs.implementationCost / (annualSavingsNumber / 12)) : 'N/A';
    
    addKeyValue('Payback Period', paybackMonths + ' months');
    addKeyValue('3-Year Total Savings', '$' + (annualSavingsNumber * 3).toLocaleString());
    addKeyValue('5-Year Total Savings', '$' + (annualSavingsNumber * 5).toLocaleString());
    addKeyValue('Net Present Value (5yr)', '$' + (annualSavingsNumber * 4.2).toLocaleString());
    
    yPosition += 10;
    
    // Implementation Roadmap
    addSectionHeader('IMPLEMENTATION ROADMAP', 'Phased Deployment Strategy');
    
    addParagraph('Our proven implementation methodology ensures minimal disruption while maximizing adoption and success rates:');
    
    const phases = [
      { 
        phase: 'Phase 1: Discovery & Analysis (Month 1-2)', 
        desc: 'Comprehensive process mapping, stakeholder interviews, technical architecture design, and detailed project planning.'
      },
      { 
        phase: 'Phase 2: Development & Testing (Month 2-4)', 
        desc: 'Custom automation development, integration setup, comprehensive testing, and user acceptance validation.'
      },
      { 
        phase: 'Phase 3: Pilot Implementation (Month 4-5)', 
        desc: 'Limited rollout, real-world testing, performance optimization, and feedback incorporation.'
      },
      { 
        phase: 'Phase 4: Full Deployment & Training (Month 5-6)', 
        desc: 'Complete system rollout, comprehensive user training, ongoing support setup, and success measurement.'
      }
    ];
    
    phases.forEach(phase => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(phase.phase, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(phase.desc, contentWidth - 10);
      doc.text(splitText, margin + 5, yPosition);
      yPosition += splitText.length * 5 + 8;
    });
    
    // Risk Analysis & Mitigation
    checkPageBreak(60);
    addSectionHeader('RISK ANALYSIS & MITIGATION', 'Identified Risks and Countermeasures');
    
    addParagraph('Our risk management approach identifies potential challenges early and implements proven mitigation strategies:');
    
    const risks = [
      { 
        risk: 'Integration Complexity', 
        impact: 'Medium',
        mitigation: 'Phased implementation with extensive testing, API-first architecture, and dedicated integration specialists.'
      },
      { 
        risk: 'User Adoption Resistance', 
        impact: 'High',
        mitigation: 'Comprehensive change management, early stakeholder engagement, extensive training, and clear communication of benefits.'
      },
      { 
        risk: 'Data Security & Compliance', 
        impact: 'High',
        mitigation: 'Enterprise-grade security protocols, compliance frameworks (SOC 2, GDPR), and regular security audits.'
      },
      { 
        risk: 'Process Standardization Challenges', 
        impact: 'Medium',
        mitigation: 'Detailed process analysis, stakeholder collaboration, and flexible automation design allowing for process variations.'
      }
    ];
    
    risks.forEach(risk => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Risk: ${risk.risk} (Impact: ${risk.impact})`, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(`Mitigation: ${risk.mitigation}`, contentWidth - 10);
      doc.text(splitText, margin + 5, yPosition);
      yPosition += splitText.length * 5 + 10;
    });
    
    // Technology Specifications
    checkPageBreak(60);
    addSectionHeader('TECHNOLOGY SPECIFICATIONS', 'Technical Architecture and Requirements');
    
    addParagraph('Our technology stack leverages cutting-edge AI and automation technologies, ensuring scalability, reliability, and future-proof architecture:');
    
    addKeyValue('Primary Technology', 'AI-Powered Process Automation');
    addKeyValue('Integration Method', 'API-based with Custom Connectors');
    addKeyValue('Security Framework', 'Enterprise SOC 2 Type II Compliant');
    addKeyValue('Scalability', 'Cloud-native, Auto-scaling Architecture');
    addKeyValue('Monitoring', '24/7 Real-time Performance Monitoring');
    addKeyValue('Support', 'Dedicated Technical Support Team');
    addKeyValue('Data Processing', 'Real-time with Batch Processing Options');
    addKeyValue('Backup & Recovery', 'Automated with 99.9% Uptime SLA');
    
    // Performance Metrics & KPIs
    checkPageBreak(50);
    addSectionHeader('PERFORMANCE METRICS & KPIs', 'Success Measurement Framework');
    
    addParagraph('Success measurement is built into every aspect of our automation solution, providing clear visibility into performance improvements and ROI achievement:');
    
    const kpis = [
      'Process Completion Time Reduction: 70-90%',
      'Error Rate Reduction: 85-95%',
      'Cost per Transaction Reduction: 60-80%',
      'Employee Satisfaction Score: >8.5/10',
      'System Uptime: >99.5%',
      'ROI Achievement Timeline: 6-12 months',
      'Process Scalability: 300%+ capacity increase',
      'Compliance Score: 100% regulatory adherence'
    ];
    
    kpis.forEach(kpi => {
      checkPageBreak(8);
      doc.text('• ' + kpi, margin, yPosition);
      yPosition += 6;
    });
    
    // Competitive Advantage
    checkPageBreak(50);
    addSectionHeader('COMPETITIVE ADVANTAGE', 'Strategic Business Benefits');
    
    addParagraph('Automation implementation provides significant competitive advantages that extend far beyond cost savings:');
    
    const advantages = [
      'Faster Time-to-Market for New Processes and Services',
      'Enhanced Customer Experience Through Consistent Service Delivery',
      'Improved Compliance and Audit Capabilities with Automated Documentation',
      'Greater Operational Agility and Scalability for Business Growth',
      'Reduced Dependency on Manual Labor and Associated Risks',
      'Enhanced Data Analytics and Insights for Strategic Decision Making',
      'Improved Employee Engagement Through Elimination of Repetitive Tasks',
      'Stronger Market Position Through Operational Excellence'
    ];
    
    advantages.forEach(advantage => {
      checkPageBreak(8);
      doc.text('• ' + advantage, margin, yPosition);
      yPosition += 6;
    });
    
    // Next Steps & Recommendations
    doc.addPage();
    yPosition = margin;
    addSectionHeader('NEXT STEPS & RECOMMENDATIONS', 'Moving Forward with Implementation');
    
    addParagraph('Based on this comprehensive analysis, we recommend the following immediate actions to begin your automation journey:');
    
    const nextSteps = [
      '1. Schedule a detailed technical consultation to discuss specific requirements and customization needs',
      '2. Conduct a comprehensive process audit to identify additional automation opportunities',
      '3. Develop a custom implementation timeline based on your organizational priorities and constraints',
      '4. Initiate pilot program development with selected high-impact processes',
      '5. Establish success metrics, KPIs, and governance framework for ongoing optimization',
      '6. Prepare stakeholder communication and change management strategy',
      '7. Review and finalize technical architecture and integration requirements'
    ];
    
    nextSteps.forEach(step => {
      checkPageBreak(12);
      const splitText = doc.splitTextToSize(step, contentWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 5 + 8;
    });
    
    yPosition += 20;
    
    // Contact Information
    doc.setFillColor(0, 102, 204);
    doc.rect(margin, yPosition, contentWidth, 70, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Aback.ai', margin + 10, yPosition + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Email: contact@aback.ai', margin + 10, yPosition + 25);
    doc.text('Website: www.aback.ai', margin + 10, yPosition + 32);
    doc.text('Phone: +91-936-981-1105', margin + 10, yPosition + 39);
    doc.text('Expertise: AI Automation Solutions', margin + 10, yPosition + 46);
    doc.text('Serving: Global Clients with Local Support', margin + 10, yPosition + 53);
    doc.text('Available: 24/7 Technical Support', margin + 10, yPosition + 60);
    
    yPosition += 80;
    doc.setTextColor(0, 0, 0);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const footerText = `© ${currentDate.getFullYear()} Aback.ai. All rights reserved. | Report generated on ${formattedDate}`;
    doc.text(footerText, margin, yPosition);
    yPosition += 5;
    doc.text('This report contains confidential and proprietary information. Distribution should be limited to authorized personnel only.', margin, yPosition);
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save the PDF
    const cleanSavings = results.annualSavings.replace(/[$,\s]/g, '');
    const filename = `Aback-AI-Automation-Report-${cleanSavings}-Annual-Savings-${formattedDate.replace(/\s+/g, '-')}.pdf`;
    doc.save(filename);
  }

  shareResults() {
    const results = this.getDisplayedResults();
    const shareText = `I could save ${results.annualSavings} annually with automation! Calculate your savings: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Automation Savings Calculator Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        this.showNotification('Results copied to clipboard!');
      });
    }
  }

  getDisplayedResults() {
    return {
      annualSavings: document.getElementById('annual-savings').textContent,
      monthlySavings: document.getElementById('monthly-savings').textContent,
      timeSaved: document.getElementById('time-saved-annually').textContent,
      roi: document.getElementById('roi-percentage').textContent,
      productivityIncrease: document.getElementById('productivity-increase').textContent
    };
  }

  generateReportHTML(results) {
    const inputs = this.getInputValues();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Calculate comprehensive metrics for the report
    const reportMetrics = this.calculateResults();
    const comprehensiveData = this.generateComprehensiveAnalysis(reportMetrics, inputs);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprehensive Automation Assessment Report - ${formattedDate}</title>
      <style>
        * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        }
        
        body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
        }
        
        .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        }
        
        /* Header Styles */
        .report-header {
        background: linear-gradient(135deg, #0066cc, #004499);
        color: white;
        padding: 60px 0;
        text-align: center;
        position: relative;
        overflow: hidden;
        }
        
        .report-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="50" r="0.5" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
        }
        
        .report-title {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        position: relative;
        z-index: 1;
        }
        
        .report-subtitle {
        font-size: 1.4rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        position: relative;
        z-index: 1;
        }
        
        .report-meta {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 30px;
        margin: 0 auto;
        max-width: 600px;
        position: relative;
        z-index: 1;
        }
        
        .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        text-align: left;
        }
        
        .meta-item h4 {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
        }
        
        .meta-item p {
        font-size: 1.1rem;
        font-weight: 600;
        }
        
        /* Page Break */
        .page-break {
        page-break-before: always;
        margin-top: 60px;
        }
        
        /* Section Styles */
        .section {
        margin: 60px 0;
        page-break-inside: avoid;
        }
        
        .section-header {
        border-bottom: 3px solid #0066cc;
        padding-bottom: 15px;
        margin-bottom: 40px;
        }
        
        .section-title {
        font-size: 2.5rem;
        color: #0066cc;
        margin-bottom: 10px;
        font-weight: 700;
        }
        
        .section-subtitle {
        font-size: 1.2rem;
        color: #666;
        font-weight: 400;
        }
        
        /* Executive Summary Styles */
        .executive-summary {
        background: linear-gradient(145deg, #f8f9ff, #e8f0ff);
        border-radius: 20px;
        padding: 50px;
        margin: 40px 0;
        border-left: 6px solid #0066cc;
        box-shadow: 0 10px 30px rgba(0, 102, 204, 0.1);
        }
        
        .key-metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
        margin: 40px 0;
        }
        
        .metric-card {
        background: white;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-top: 4px solid #0066cc;
        transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
        transform: translateY(-5px);
        }
        
        .metric-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #0066cc;
        margin-bottom: 10px;
        display: block;
        }
        
        .metric-value.negative {
        color: #dc3545;
        }
        
        .metric-label {
        font-size: 1.1rem;
        color: #555;
        font-weight: 600;
        margin-bottom: 15px;
        }
        
        .metric-context {
        font-size: 0.9rem;
        color: #777;
        line-height: 1.4;
        }
        
        /* Table Styles */
        .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 30px 0;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .data-table th {
        background: #0066cc;
        color: white;
        padding: 20px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.9rem;
        }
        
        .data-table td {
        padding: 18px 20px;
        border-bottom: 1px solid #eee;
        font-size: 1rem;
        }
        
        .data-table tr:nth-child(even) {
        background: #f8f9fa;
        }
        
        .data-table tr:hover {
        background: #e8f0ff;
        }
        
        .negative-value {
        color: #dc3545 !important;
        font-weight: 700;
        }
        
        /* Highlight Boxes */
        .highlight-box {
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        border: 1px solid #ffd93d;
        border-radius: 15px;
        padding: 30px;
        margin: 30px 0;
        position: relative;
        }
        
        .highlight-box::before {
        content: '💡';
        position: absolute;
        top: -15px;
        left: 30px;
        background: #ffd93d;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        border: 3px solid white;
        }
        
        .warning-box {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        border: 1px solid #f87171;
        border-radius: 15px;
        padding: 30px;
        margin: 30px 0;
        position: relative;
        }
        
        .warning-box::before {
        content: '⚠️';
        position: absolute;
        top: -15px;
        left: 30px;
        background: #f87171;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        border: 3px solid white;
        }
        
        .success-box {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        border: 1px solid #34d399;
        border-radius: 15px;
        padding: 30px;
        margin: 30px 0;
        position: relative;
        }
        
        .success-box::before {
        content: '✅';
        position: absolute;
        top: -15px;
        left: 30px;
        background: #34d399;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        border: 3px solid white;
        }
        
        /* Timeline Styles */
        .timeline {
        position: relative;
        padding: 40px 0;
        }
        
        .timeline::before {
        content: '';
        position: absolute;
        left: 30px;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #0066cc;
        }
        
        .timeline-item {
        position: relative;
        padding: 20px 0 20px 80px;
        margin-bottom: 30px;
        }
        
        .timeline-item::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 30px;
        width: 20px;
        height: 20px;
        background: #0066cc;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 10px rgba(0, 102, 204, 0.3);
        }
        
        .timeline-content {
        background: white;
        border-radius: 10px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #0066cc;
        }
        
        .timeline-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: #0066cc;
        margin-bottom: 10px;
        }
        
        .timeline-duration {
        background: #e8f0ff;
        color: #0066cc;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 15px;
        }
        
        /* Chart Placeholders */
        .chart-placeholder {
        background: linear-gradient(145deg, #f1f3f4, #e8eaed);
        border: 2px dashed #0066cc;
        border-radius: 15px;
        padding: 60px;
        text-align: center;
        margin: 30px 0;
        color: #666;
        font-style: italic;
        }
        
        /* Footer */
        .report-footer {
        background: #f8f9fa;
        padding: 60px 0;
        text-align: center;
        border-top: 3px solid #0066cc;
        margin-top: 60px;
        }
        
        .footer-content {
        max-width: 800px;
        margin: 0 auto;
        }
        
        .footer-title {
        font-size: 2rem;
        color: #0066cc;
        margin-bottom: 20px;
        font-weight: 700;
        }
        
        .contact-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 30px;
        margin: 40px 0;
        }
        
        .contact-item {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .contact-item h4 {
        color: #0066cc;
        margin-bottom: 10px;
        font-size: 1.1rem;
        }
        
        /* Print Styles */
        @media print {
        body { font-size: 12pt; }
        .page-break { page-break-before: always; }
        .section { page-break-inside: avoid; }
        .metric-card { break-inside: avoid; }
        .timeline-item { break-inside: avoid; }
        .highlight-box, .warning-box, .success-box { break-inside: avoid; }
        }
        
          }
        </style>
      </head>
      <body>
        <!-- Report Header -->
        <div class="report-header">
          <div class="container">
            <h1 class="report-title">Comprehensive Automation Assessment Report</h1>
            <p class="report-subtitle">Strategic Analysis & Implementation Roadmap</p>
            <div class="report-meta">
              <div class="meta-grid">
                <div class="meta-item">
                  <h4>Generated On</h4>
                  <p>${formattedDate}</p>
                </div>
                <div class="meta-item">
                  <h4>Report ID</h4>
                  <p>AAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div class="meta-item">
                  <h4>Industry Sector</h4>
                  <p>${comprehensiveData.industry || 'General Business'}</p>
                </div>
                <div class="meta-item">
                  <h4>Analysis Period</h4>
                  <p>5-Year Projection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="container">
          <div class="executive-summary">
            <h2 style="color: #0066cc; font-size: 2.2rem; margin-bottom: 20px;">📊 Executive Summary</h2>
            <p style="font-size: 1.2rem; line-height: 1.8; color: #444; margin-bottom: 30px;">
              This comprehensive automation assessment reveals significant opportunities for operational transformation 
              through intelligent process automation. Based on your current operations processing 
              <strong>${this.formatNumber(Math.round(reportMetrics.tasksAutomatedAnnually))} tasks annually</strong>, 
              our analysis projects substantial returns on automation investment.
            </p>
            
            <div class="key-metrics-grid">
              <div class="metric-card">
                <span class="metric-value">${this.formatCurrency(reportMetrics.totalAnnualBenefit)}</span>
                <div class="metric-label">Annual Savings Potential</div>
                <div class="metric-context">
                  Represents ${Math.round(reportMetrics.roiPercentage)}% ROI with ${reportMetrics.breakevenMonths}-month payback period
                </div>
              </div>
              <div class="metric-card">
                <span class="metric-value">${this.formatNumber(Math.round(reportMetrics.timesSavedAnnually))}</span>
                <div class="metric-label">Hours Saved Annually</div>
                <div class="metric-context">
                  Equivalent to ${Math.round(reportMetrics.timesSavedAnnually / 2000 * 10) / 10} full-time employees
                </div>
              </div>
              <div class="metric-card">
                <span class="metric-value">${Math.round(inputs.automationEfficiency)}%</span>
                <div class="metric-label">Process Automation Rate</div>
                <div class="metric-context">
                  ${comprehensiveData.automationAssessment.level} automation implementation
                </div>
              </div>
              <div class="metric-card">
                <span class="metric-value">${Math.round(reportMetrics.productivityIncrease)}%</span>
                <div class="metric-label">Productivity Improvement</div>
                <div class="metric-context">
                  Enhanced operational efficiency across automated processes
                </div>
              </div>
            </div>
          </div>

          <!-- Current State Analysis -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">1. Current State Analysis</h2>
              <p class="section-subtitle">Comprehensive assessment of existing operations and automation opportunities</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">📈 Operational Baseline</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Process Metric</th>
                  <th>Current State</th>
                  <th>Industry Benchmark</th>
                  <th>Automation Potential</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Task Volume</strong></td>
                  <td>${this.formatNumber(Math.round(inputs.tasksPerMonth))} tasks/month</td>
                  <td>${comprehensiveData.industryBenchmarks.taskVolume}</td>
                  <td>High - Repetitive processes ideal for automation</td>
                </tr>
                <tr>
                  <td><strong>Processing Time</strong></td>
                  <td>${inputs.timePerTask} ${inputs.timeUnit} per task</td>
                  <td>${comprehensiveData.industryBenchmarks.processingTime}</td>
                  <td>${comprehensiveData.automationOpportunities.timeReduction}</td>
                </tr>
                <tr>
                  <td><strong>Labor Cost</strong></td>
                  <td>$${inputs.hourlyRate}/hour</td>
                  <td>${comprehensiveData.industryBenchmarks.laborCost}</td>
                  <td>${comprehensiveData.automationOpportunities.costReduction}</td>
                </tr>
                <tr>
                  <td><strong>Error Rate</strong></td>
                  <td>${inputs.errorRate}%</td>
                  <td>${comprehensiveData.industryBenchmarks.errorRate}</td>
                  <td>Significant - AI can reduce errors by 90-95%</td>
                </tr>
                <tr>
                  <td><strong>Staff Utilization</strong></td>
                  <td>${inputs.employeesAffected} employees affected</td>
                  <td>${comprehensiveData.industryBenchmarks.staffing}</td>
                  <td>Medium-High - Staff can focus on value-added work</td>
                </tr>
              </tbody>
            </table>

            ${comprehensiveData.currentStateIssues.length > 0 ? `
            <div class="warning-box">
              <h4 style="color: #dc3545; margin-bottom: 15px;">Identified Process Pain Points</h4>
              <ul style="margin-left: 20px; line-height: 1.8;">
                ${comprehensiveData.currentStateIssues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>

          <!-- Automation Strategy & Recommendations -->
          <div class="section page-break">
            <div class="section-header">
              <h2 class="section-title">2. Automation Strategy & Recommendations</h2>
              <p class="section-subtitle">Detailed automation approach and technology recommendations</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🤖 Recommended Automation Technologies</h3>
            
            ${comprehensiveData.recommendedTechnologies.map((tech, index) => `
              <div style="background: white; border-radius: 15px; padding: 30px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #0066cc;">
                <h4 style="color: #0066cc; font-size: 1.4rem; margin-bottom: 15px;">${tech.name}</h4>
                <p style="margin-bottom: 15px; line-height: 1.6;"><strong>Use Case:</strong> ${tech.useCase}</p>
                <p style="margin-bottom: 15px; line-height: 1.6;"><strong>Expected Impact:</strong> ${tech.impact}</p>
                <p style="margin-bottom: 15px; line-height: 1.6;"><strong>Implementation Timeline:</strong> ${tech.timeline}</p>
                <p style="color: #666; line-height: 1.6;"><strong>Key Benefits:</strong> ${tech.benefits}</p>
              </div>
            `).join('')}

            <div class="highlight-box">
              <h4 style="color: #856404; margin-bottom: 15px;">Strategic Automation Approach</h4>
              <p style="line-height: 1.8; margin-bottom: 20px;">
                Based on your process characteristics, we recommend a <strong>${comprehensiveData.automationStrategy.approach}</strong> 
                implementation strategy. This approach prioritizes ${comprehensiveData.automationStrategy.priority} and delivers 
                ${comprehensiveData.automationStrategy.expectedTimeline}.
              </p>
              <ul style="margin-left: 20px; line-height: 1.8;">
                ${comprehensiveData.automationStrategy.keyPrinciples.map(principle => `<li>${principle}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Financial Impact Analysis -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">3. Financial Impact Analysis</h2>
              <p class="section-subtitle">Comprehensive ROI analysis and cost-benefit breakdown</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">💰 5-Year Financial Projection</h3>
            
            <div style="background: linear-gradient(145deg, #f8f9ff, #e8f0ff); border-radius: 20px; padding: 40px; margin: 30px 0;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px;">
                ${comprehensiveData.financialProjection.map(year => `
                  <div style="text-align: center; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <h4 style="color: #0066cc; font-size: 1.1rem; margin-bottom: 10px;">Year ${year.year}</h4>
                    <div style="font-size: 1.8rem; font-weight: 700; color: #28a745; margin-bottom: 10px;">${year.savings}</div>
                    <div style="font-size: 0.9rem; color: #666;">Net Savings</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">ROI: ${year.roi}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">📊 Cost Breakdown Analysis</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cost Category</th>
                  <th>Current Annual Cost</th>
                  <th>Post-Automation Cost</th>
                  <th>Annual Savings</th>
                  <th>Savings %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Labor Costs</strong></td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.currentLaborCost)}</td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.postAutomationLaborCost)}</td>
                  <td style="color: #28a745; font-weight: 600;">${this.formatCurrency(comprehensiveData.costBreakdown.laborSavings)}</td>
                  <td style="color: #28a745; font-weight: 600;">${Math.round(comprehensiveData.costBreakdown.laborSavingsPercentage)}%</td>
                </tr>
                <tr>
                  <td><strong>Error & Rework Costs</strong></td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.currentErrorCost)}</td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.postAutomationErrorCost)}</td>
                  <td style="color: #28a745; font-weight: 600;">${this.formatCurrency(comprehensiveData.costBreakdown.errorCostSavings)}</td>
                  <td style="color: #28a745; font-weight: 600;">${Math.round(comprehensiveData.costBreakdown.errorSavingsPercentage)}%</td>
                </tr>
                <tr>
                  <td><strong>Operational Overhead</strong></td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.currentOverheadCost)}</td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.postAutomationOverheadCost)}</td>
                  <td style="color: #28a745; font-weight: 600;">${this.formatCurrency(comprehensiveData.costBreakdown.overheadSavings)}</td>
                  <td style="color: #28a745; font-weight: 600;">${Math.round(comprehensiveData.costBreakdown.overheadSavingsPercentage)}%</td>
                </tr>
                <tr style="background: #e8f5e8; font-weight: 600;">
                  <td><strong>Total Annual Costs</strong></td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.totalCurrentCost)}</td>
                  <td>${this.formatCurrency(comprehensiveData.costBreakdown.totalPostAutomationCost)}</td>
                  <td style="color: #28a745; font-weight: 700; font-size: 1.1rem;">${this.formatCurrency(comprehensiveData.costBreakdown.totalAnnualSavings)}</td>
                  <td style="color: #28a745; font-weight: 700; font-size: 1.1rem;">${Math.round(comprehensiveData.costBreakdown.totalSavingsPercentage)}%</td>
                </tr>
              </tbody>
            </table>

            <div class="success-box">
              <h4 style="color: #155724; margin-bottom: 15px;">Investment Recovery Analysis</h4>
              <p style="line-height: 1.8;">
                With a total implementation investment of <strong>${this.formatCurrency(inputs.implementationCost || comprehensiveData.estimatedImplementationCost)}</strong> 
                and projected annual savings of <strong>${this.formatCurrency(reportMetrics.totalAnnualBenefit)}</strong>, 
                your automation initiative will achieve <strong>full cost recovery in ${reportMetrics.breakevenMonths} months</strong>.
              </p>
              <p style="line-height: 1.8; margin-top: 15px;">
                Over a 5-year period, the total net value creation is projected at 
                <strong>${this.formatCurrency(reportMetrics.totalAnnualBenefit * 5 - (inputs.implementationCost || comprehensiveData.estimatedImplementationCost))}</strong>, 
                representing a ${Math.round(((reportMetrics.totalAnnualBenefit * 5 - (inputs.implementationCost || comprehensiveData.estimatedImplementationCost)) / (inputs.implementationCost || comprehensiveData.estimatedImplementationCost)) * 100)}% cumulative ROI.
              </p>
            </div>
          </div>

          <!-- Implementation Roadmap -->
          <div class="section page-break">
            <div class="section-header">
              <h2 class="section-title">4. Implementation Roadmap</h2>
              <p class="section-subtitle">Detailed project timeline and milestone planning</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🗓️ Phased Implementation Plan</h3>
            
            <div class="timeline">
              ${comprehensiveData.implementationPhases.map((phase, index) => `
                <div class="timeline-item">
                  <div class="timeline-content">
                    <div class="timeline-title">Phase ${index + 1}: ${phase.name}</div>
                    <div class="timeline-duration">${phase.duration}</div>
                    <p style="margin-bottom: 20px; line-height: 1.6; color: #555;">${phase.description}</p>
                    <h5 style="color: #0066cc; margin-bottom: 10px;">Key Activities:</h5>
                    <ul style="margin-left: 20px; line-height: 1.6; color: #666;">
                      ${phase.activities.map(activity => `<li>${activity}</li>`).join('')}
                    </ul>
                    <h5 style="color: #0066cc; margin: 15px 0 10px;">Expected Outcomes:</h5>
                    <ul style="margin-left: 20px; line-height: 1.6; color: #666;">
                      ${phase.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="highlight-box">
              <h4 style="color: #856404; margin-bottom: 15px;">Critical Success Factors</h4>
              <ul style="margin-left: 20px; line-height: 1.8;">
                ${comprehensiveData.criticalSuccessFactors.map(factor => `<li>${factor}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Risk Analysis & Mitigation -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">5. Risk Analysis & Mitigation</h2>
              <p class="section-subtitle">Comprehensive risk assessment and mitigation strategies</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">⚠️ Risk Assessment Matrix</h3>
            
            <table class="data-table">
              <thead>
                <tr>
                  <th>Risk Category</th>
                  <th>Risk Description</th>
                  <th>Probability</th>
                  <th>Impact</th>
                  <th>Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody>
                ${comprehensiveData.riskAnalysis.map(risk => `
                  <tr>
                    <td><strong>${risk.category}</strong></td>
                    <td>${risk.description}</td>
                    <td style="color: ${risk.probabilityColor}; font-weight: 600;">${risk.probability}</td>
                    <td style="color: ${risk.impactColor}; font-weight: 600;">${risk.impact}</td>
                    <td>${risk.mitigation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="warning-box">
              <h4 style="color: #721c24; margin-bottom: 15px;">Key Risk Mitigation Recommendations</h4>
              <ul style="margin-left: 20px; line-height: 1.8;">
                <li><strong>Change Management:</strong> Implement comprehensive stakeholder engagement and training programs</li>
                <li><strong>Technology Risk:</strong> Conduct thorough proof-of-concept testing before full deployment</li>
                <li><strong>Integration Risk:</strong> Plan phased integration with rollback capabilities</li>
                <li><strong>Performance Risk:</strong> Establish clear KPIs and monitoring systems</li>
                <li><strong>Security Risk:</strong> Implement robust data protection and access control measures</li>
              </ul>
            </div>
          </div>

          <!-- Technology Specifications -->
          <div class="section page-break">
            <div class="section-header">
              <h2 class="section-title">6. Technology Specifications</h2>
              <p class="section-subtitle">Detailed technical requirements and system architecture</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🔧 Technical Architecture Overview</h3>
            
            ${comprehensiveData.technicalSpecs.map((spec, index) => `
              <div style="background: white; border-radius: 15px; padding: 30px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #0066cc;">
                <h4 style="color: #0066cc; font-size: 1.4rem; margin-bottom: 15px;">${spec.component}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                  <div>
                    <h5 style="color: #666; margin-bottom: 10px;">Technology Stack:</h5>
                    <ul style="margin-left: 20px; line-height: 1.6; color: #555;">
                      ${spec.technologies.map(tech => `<li>${tech}</li>`).join('')}
                    </ul>
                  </div>
                  <div>
                    <h5 style="color: #666; margin-bottom: 10px;">Key Capabilities:</h5>
                    <ul style="margin-left: 20px; line-height: 1.6; color: #555;">
                      ${spec.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                    </ul>
                  </div>
                </div>
                <p style="margin-top: 20px; line-height: 1.6; color: #666;"><strong>Integration Requirements:</strong> ${spec.integrationRequirements}</p>
              </div>
            `).join('')}

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🔒 Security & Compliance Framework</h3>
            
            <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                <div>
                  <h4 style="color: #0066cc; margin-bottom: 15px;">Security Measures</h4>
                  <ul style="margin-left: 20px; line-height: 1.6; color: #555;">
                    ${comprehensiveData.securityFramework.securityMeasures.map(measure => `<li>${measure}</li>`).join('')}
                  </ul>
                </div>
                <div>
                  <h4 style="color: #0066cc; margin-bottom: 15px;">Compliance Standards</h4>
                  <ul style="margin-left: 20px; line-height: 1.6; color: #555;">
                    ${comprehensiveData.securityFramework.complianceStandards.map(standard => `<li>${standard}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Metrics & KPIs -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">7. Performance Metrics & KPIs</h2>
              <p class="section-subtitle">Comprehensive measurement framework for tracking automation success</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">📊 Key Performance Indicators</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 30px 0;">
              ${comprehensiveData.kpiCategories.map(category => `
                <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-top: 4px solid #0066cc;">
                  <h4 style="color: #0066cc; margin-bottom: 20px; font-size: 1.3rem;">${category.name}</h4>
                  <ul style="line-height: 1.8; color: #555;">
                    ${category.metrics.map(metric => `
                      <li style="margin-bottom: 10px;">
                        <strong>${metric.name}:</strong> ${metric.description}
                        <br><span style="color: #666; font-size: 0.9rem;">Target: ${metric.target}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">📈 Projected Performance Improvements</h3>
            
            <table class="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Current Performance</th>
                  <th>Projected Performance</th>
                  <th>Improvement</th>
                  <th>Timeline to Achieve</th>
                </tr>
              </thead>
              <tbody>
                ${comprehensiveData.performanceProjections.map(projection => `
                  <tr>
                    <td><strong>${projection.metric}</strong></td>
                    <td>${projection.current}</td>
                    <td>${projection.projected}</td>
                    <td style="color: #28a745; font-weight: 600;">${projection.improvement}</td>
                    <td>${projection.timeline}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Competitive Advantage Analysis -->
          <div class="section page-break">
            <div class="section-header">
              <h2 class="section-title">8. Competitive Advantage Analysis</h2>
              <p class="section-subtitle">Strategic positioning and market differentiation opportunities</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🎯 Strategic Benefits</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
              ${comprehensiveData.strategicBenefits.map(benefit => `
                <div style="background: linear-gradient(145deg, #f8f9ff, #e8f0ff); border-radius: 15px; padding: 25px; border-left: 4px solid #0066cc;">
                  <h4 style="color: #0066cc; margin-bottom: 15px; font-size: 1.2rem;">${benefit.title}</h4>
                  <p style="line-height: 1.6; color: #555; margin-bottom: 15px;">${benefit.description}</p>
                  <div style="background: white; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <h5 style="color: #666; margin-bottom: 10px; font-size: 0.9rem;">COMPETITIVE IMPACT:</h5>
                    <p style="color: #0066cc; font-weight: 600; font-size: 0.95rem;">${benefit.competitiveImpact}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="success-box">
              <h4 style="color: #155724; margin-bottom: 15px;">Market Positioning Opportunities</h4>
              <p style="line-height: 1.8; margin-bottom: 20px;">
                By implementing automation at this scale and efficiency level, your organization will be positioned 
                in the <strong>top ${comprehensiveData.marketPositioning.percentile}% of industry performers</strong> 
                for operational efficiency and cost management.
              </p>
              <ul style="margin-left: 20px; line-height: 1.8;">
                ${comprehensiveData.marketPositioning.advantages.map(advantage => `<li>${advantage}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Conclusion & Next Steps -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">9. Conclusion & Recommended Next Steps</h2>
              <p class="section-subtitle">Strategic recommendations and immediate action items</p>
            </div>

            <div class="executive-summary" style="background: linear-gradient(145deg, #e8f5e8, #d1fae5);">
              <h3 style="color: #155724; font-size: 2rem; margin-bottom: 20px;">🎯 Strategic Recommendation</h3>
              <p style="font-size: 1.2rem; line-height: 1.8; color: #155724; margin-bottom: 30px;">
                Based on our comprehensive analysis, we <strong>strongly recommend proceeding with automation implementation</strong>. 
                The projected ${Math.round(reportMetrics.roiPercentage)}% ROI and ${reportMetrics.breakevenMonths}-month payback period 
                represent an exceptional investment opportunity with minimal risk.
              </p>
              
              <div style="background: white; border-radius: 15px; padding: 30px; margin: 30px 0;">
                <h4 style="color: #0066cc; margin-bottom: 20px; font-size: 1.4rem;">Immediate Action Items (Next 30 Days)</h4>
                <ol style="line-height: 1.8; color: #555;">
                  ${comprehensiveData.immediateActions.map(action => `<li style="margin-bottom: 10px;">${action}</li>`).join('')}
                </ol>
              </div>

              <div style="background: white; border-radius: 15px; padding: 30px; margin: 30px 0;">
                <h4 style="color: #0066cc; margin-bottom: 20px; font-size: 1.4rem;">Medium-Term Objectives (3-6 Months)</h4>
                <ul style="line-height: 1.8; color: #555;">
                  ${comprehensiveData.mediumTermObjectives.map(objective => `<li style="margin-bottom: 10px;">${objective}</li>`).join('')}
                </ul>
              </div>
            </div>

            <div class="highlight-box">
              <h4 style="color: #856404; margin-bottom: 15px;">Investment Justification Summary</h4>
              <p style="line-height: 1.8;">
                The automation initiative represents a <strong>low-risk, high-reward investment</strong> with:
              </p>
              <ul style="margin: 15px 0 15px 20px; line-height: 1.8;">
                <li><strong>Financial Returns:</strong> ${Math.round(reportMetrics.roiPercentage)}% ROI with ${this.formatCurrency(reportMetrics.totalAnnualBenefit)} annual savings</li>
                <li><strong>Operational Benefits:</strong> ${Math.round(reportMetrics.timesSavedAnnually)} hours saved annually (${Math.round(reportMetrics.timesSavedAnnually / 2000 * 10) / 10} FTE equivalent)</li>
                <li><strong>Strategic Advantage:</strong> Enhanced competitiveness and scalability</li>
                <li><strong>Risk Profile:</strong> Low implementation risk with proven technologies</li>
              </ul>
            </div>
          </div>

          <!-- Appendices -->
          <div class="section page-break">
            <div class="section-header">
              <h2 class="section-title">10. Appendices</h2>
              <p class="section-subtitle">Supporting data, assumptions, and detailed calculations</p>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">📋 Calculation Methodology</h3>
            
            <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <h4 style="color: #0066cc; margin-bottom: 20px;">Input Parameters Used in Analysis</h4>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Source/Assumption</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tasks per ${inputs.taskFrequency}</td>
                    <td>${this.formatNumber(inputs.tasksPerPeriod)}</td>
                    <td>Client-provided operational data</td>
                  </tr>
                  <tr>
                    <td>Time per task</td>
                    <td>${inputs.timePerTask} ${inputs.timeUnit}</td>
                    <td>Client-provided process timing</td>
                  </tr>
                  <tr>
                    <td>Hourly labor rate</td>
                    <td>$${inputs.hourlyRate}</td>
                    <td>Client-provided or market benchmark</td>
                  </tr>
                  <tr>
                    <td>Employees affected</td>
                    <td>${inputs.employeesAffected}</td>
                    <td>Client-provided organizational data</td>
                  </tr>
                  <tr>
                    <td>Current error rate</td>
                    <td>${inputs.errorRate}%</td>
                    <td>Client-provided or industry benchmark</td>
                  </tr>
                  <tr>
                    <td>Automation efficiency</td>
                    <td>${inputs.automationEfficiency}%</td>
                    <td>Technology capability assessment</td>
                  </tr>
                  <tr>
                    <td>Implementation cost</td>
                    <td>${this.formatCurrency(inputs.implementationCost || comprehensiveData.estimatedImplementationCost)}</td>
                    <td>Professional services estimate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">🔗 Industry Benchmarks & References</h3>
            
            <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <p style="line-height: 1.8; color: #555; margin-bottom: 20px;">
                This analysis incorporates industry-leading benchmarks and best practices from:
              </p>
              <ul style="margin-left: 20px; line-height: 1.8; color: #555;">
                ${comprehensiveData.industryReferences.map(ref => `<li>${ref}</li>`).join('')}
              </ul>
            </div>

            <h3 style="color: #0066cc; font-size: 1.8rem; margin: 40px 0 20px;">⚠️ Assumptions & Disclaimers</h3>
            
            <div style="background: #fff3cd; border: 1px solid #ffd93d; border-radius: 15px; padding: 30px;">
              <ul style="margin-left: 20px; line-height: 1.8; color: #856404;">
                <li>Projections based on current operational parameters and may vary with changing business conditions</li>
                <li>ROI calculations assume consistent task volume and complexity over the projection period</li>
                <li>Implementation timeline estimates are based on typical project complexity and may vary</li>
                <li>Cost savings projections exclude potential indirect benefits such as improved customer satisfaction</li>
                <li>Technology performance assumptions based on current AI/automation capabilities</li>
                <li>Financial projections are pre-tax and exclude financing costs</li>
                <li>Actual results may differ from projections due to unforeseen implementation challenges</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Report Footer -->
        <div class="report-footer">
          <div class="container">
            <div class="footer-content">
              <h2 class="footer-title">Ready to Transform Your Operations?</h2>
              <p style="font-size: 1.2rem; line-height: 1.8; color: #666; margin-bottom: 40px;">

                This comprehensive analysis demonstrates the significant value automation can deliver to your organization. 
                Contact Aback.ai today to begin your automation journey with India's leading AI automation agency.
              </p>
              
              <div class="contact-info">
                <div class="contact-item">
                  <h4>🌐 Website</h4>
                  <p>www.aback.ai</p>
                </div>
                <div class="contact-item">
                  <h4>📧 Email</h4>
                  <p>contact@aback.ai</p>
                </div>
                <div class="contact-item">
                  <h4>📞 Phone</h4>
                  <p>+91-936-981-1105</p>
                </div>
                <div class="contact-item">
                  <h4>🏢 Expertise</h4>
                  <p>AI Automation Solutions</p>
                </div>
              </div>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #dee2e6; color: #666; font-size: 0.95rem;">
                <p><strong>About Aback.ai:</strong> India's premier AI automation agency, specializing in intelligent process automation, 
                document processing, workflow optimization, and enterprise AI solutions. With over 500+ successful implementations 
                and $175M+ in verified client savings, we deliver measurable results through cutting-edge automation technology.</p>
              </div>
              
              <div style="margin-top: 30px; color: #999; font-size: 0.9rem;">
                <p>© ${currentDate.getFullYear()} Aback.ai. All rights reserved. | Report generated on ${formattedDate}</p>
                <p style="margin-top: 10px;">This report contains confidential and proprietary information. Distribution should be limited to authorized personnel only.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate comprehensive analysis data for the detailed report
  generateComprehensiveAnalysis(results, inputs) {
    // Determine automation assessment level
    let automationLevel = 'Basic';
    if (inputs.automationEfficiency >= 90) automationLevel = 'Advanced';
    else if (inputs.automationEfficiency >= 75) automationLevel = 'Intermediate';

    // Determine industry based on inputs or default
    let industry = 'General Business';
    if (inputs.hourlyRate >= 100) industry = 'Legal/Professional Services';
    else if (inputs.hourlyRate >= 60) industry = 'Finance/Insurance';
    else if (inputs.hourlyRate >= 40) industry = 'Healthcare/Technology';
    else if (inputs.hourlyRate >= 25) industry = 'Manufacturing';
    else industry = 'Retail/Service';

    // Calculate estimated implementation cost if not provided
    const estimatedImplementationCost = inputs.implementationCost || 
      Math.round(inputs.employeesAffected * 2000 + inputs.tasksPerMonth * 5);

    return {
      industry: industry,
      automationAssessment: {
        level: automationLevel,
        complexity: automationLevel === 'Advanced' ? 'High' : automationLevel === 'Intermediate' ? 'Medium' : 'Low'
      },
      estimatedImplementationCost: estimatedImplementationCost,

      // Industry benchmarks
      industryBenchmarks: {
        taskVolume: '80-200 tasks/month typical',
        processingTime: '15-45 minutes average',
        laborCost: '$25-75/hour range',
        errorRate: '5-15% industry standard',
        staffing: '3-15 employees typical'
      },

      // Automation opportunities
      automationOpportunities: {
        timeReduction: 'High - 70-95% time savings possible',
        costReduction: 'Significant - 60-85% cost reduction potential'
      },

      // Current state issues
      currentStateIssues: [
        'High manual processing overhead consuming valuable employee time',
        'Error-prone manual processes leading to rework and quality issues',
        'Limited scalability with current manual approach',
        'Inconsistent processing times affecting service delivery',
        'Resource allocation inefficiencies reducing strategic focus'
      ],

      // Recommended technologies
      recommendedTechnologies: [
        {
          name: 'Robotic Process Automation (RPA)',
          useCase: 'Automate repetitive, rule-based tasks and data processing workflows',
          impact: '85-95% reduction in manual processing time',
          timeline: '2-4 months implementation',
          benefits: 'Immediate productivity gains with minimal system changes'
        },
        {
          name: 'AI-Powered Document Processing',
          useCase: 'Intelligent extraction and processing of structured/unstructured documents',
          impact: '90% faster document processing with 99%+ accuracy',
          timeline: '3-6 months implementation',
          benefits: 'Eliminate manual data entry and reduce processing errors'
        },
        {
          name: 'Workflow Orchestration Platform',
          useCase: 'Coordinate and optimize end-to-end business process flows',
          impact: '60-80% improvement in process efficiency',
          timeline: '4-8 months implementation',
          benefits: 'Enhanced visibility, control, and optimization of business processes'
        }
      ],

      // Automation strategy
      automationStrategy: {
        approach: 'phased implementation',
        priority: 'high-impact, low-risk processes first',
        expectedTimeline: 'measurable results within 90 days',
        keyPrinciples: [
          'Start with pilot processes to validate automation approach',
          'Focus on processes with high volume and standardized procedures',
          'Implement robust testing and quality assurance protocols',
          'Ensure seamless integration with existing systems and workflows',
          'Provide comprehensive training and change management support'
        ]
      },

      // Financial projection
      financialProjection: [
        {
          year: 1,
          savings: this.formatCurrency(results.totalAnnualBenefit - estimatedImplementationCost),
          roi: Math.round(((results.totalAnnualBenefit - estimatedImplementationCost) / estimatedImplementationCost) * 100) + '%'
        },
        {
          year: 2,
          savings: this.formatCurrency(results.totalAnnualBenefit),
          roi: Math.round((results.totalAnnualBenefit / estimatedImplementationCost) * 100) + '%'
        },
        {
          year: 3,
          savings: this.formatCurrency(results.totalAnnualBenefit * 1.1),
          roi: Math.round((results.totalAnnualBenefit * 1.1 / estimatedImplementationCost) * 100) + '%'
        },
        {
          year: 4,
          savings: this.formatCurrency(results.totalAnnualBenefit * 1.2),
          roi: Math.round((results.totalAnnualBenefit * 1.2 / estimatedImplementationCost) * 100) + '%'
        },
        {
          year: 5,
          savings: this.formatCurrency(results.totalAnnualBenefit * 1.3),
          roi: Math.round((results.totalAnnualBenefit * 1.3 / estimatedImplementationCost) * 100) + '%'
        }
      ],

      // Cost breakdown
      costBreakdown: {
        currentLaborCost: Math.round(inputs.tasksPerMonth * 12 * (inputs.timePerTask / 60) * inputs.hourlyRate * inputs.employeesAffected),
        postAutomationLaborCost: Math.round(inputs.tasksPerMonth * 12 * (inputs.timePerTask / 60) * inputs.hourlyRate * inputs.employeesAffected * (1 - inputs.automationEfficiency / 100)),
        laborSavings: Math.round(results.laborSavings || results.totalAnnualBenefit * 0.8),
        laborSavingsPercentage: Math.round(inputs.automationEfficiency * 0.9),
        currentErrorCost: Math.round((inputs.errorRate / 100) * inputs.tasksPerMonth * 12 * inputs.employeesAffected * inputs.timePerTask * 0.5 * inputs.hourlyRate),
        postAutomationErrorCost: Math.round((inputs.errorRate / 100) * 0.1 * inputs.tasksPerMonth * 12 * inputs.employeesAffected * inputs.timePerTask * 0.5 * inputs.hourlyRate),
        errorCostSavings: Math.round((inputs.errorRate / 100) * 0.9 * inputs.tasksPerMonth * 12 * inputs.employeesAffected * inputs.timePerTask * 0.5 * inputs.hourlyRate),
        errorSavingsPercentage: 90,
        currentOverheadCost: Math.round(inputs.employeesAffected * 15000),
        postAutomationOverheadCost: Math.round(inputs.employeesAffected * 12000),
        overheadSavings: Math.round(inputs.employeesAffected * 3000),
        overheadSavingsPercentage: 20,
        totalCurrentCost: Math.round(inputs.tasksPerMonth * 12 * (inputs.timePerTask / 60) * inputs.hourlyRate * inputs.employeesAffected + inputs.employeesAffected * 15000),
        totalPostAutomationCost: Math.round(inputs.tasksPerMonth * 12 * (inputs.timePerTask / 60) * inputs.hourlyRate * inputs.employeesAffected * (1 - inputs.automationEfficiency / 100) + inputs.employeesAffected * 12000),
        totalAnnualSavings: Math.round(results.totalAnnualBenefit),
        totalSavingsPercentage: Math.round((results.totalAnnualBenefit / (inputs.tasksPerMonth * 12 * (inputs.timePerTask / 60) * inputs.hourlyRate * inputs.employeesAffected + inputs.employeesAffected * 15000)) * 100)
      },

      // Implementation phases
      implementationPhases: [
        {
          name: 'Assessment & Planning',
          duration: '4-6 weeks',
          description: 'Comprehensive process analysis, technology selection, and implementation roadmap development',
          activities: [
            'Detailed process mapping and documentation',
            'Technology stack evaluation and selection',
            'Integration requirements analysis',
            'Project timeline and resource planning',
            'Risk assessment and mitigation planning'
          ],
          outcomes: [
            'Complete automation implementation plan',
            'Technology architecture design',
            'Project charter and success metrics',
            'Stakeholder alignment and buy-in'
          ]
        },
        {
          name: 'Pilot Implementation',
          duration: '6-8 weeks',
          description: 'Deploy automation solution for a limited scope to validate approach and refine processes',
          activities: [
            'Development environment setup',
            'Core automation workflows development',
            'Initial system integration and testing',
            'User acceptance testing with pilot group',
            'Performance monitoring and optimization'
          ],
          outcomes: [
            'Proven automation solution for pilot processes',
            'Validated technology performance metrics',
            'Refined implementation approach',
            'Initial user feedback and training materials'
          ]
        },
        {
          name: 'Full Deployment',
          duration: '8-12 weeks',
          description: 'Scale automation solution across all identified processes and user groups',
          activities: [
            'Production environment deployment',
            'Complete workflow automation implementation',
            'Comprehensive user training programs',
            'System monitoring and performance optimization',
            'Change management and support processes'
          ],
          outcomes: [
            'Fully operational automation solution',
            'Trained user base with ongoing support',
            'Established monitoring and maintenance procedures',
            'Achieved target performance metrics'
          ]
        },
        {
          name: 'Optimization & Expansion',
          duration: 'Ongoing',
          description: 'Continuous improvement and identification of additional automation opportunities',
          activities: [
            'Performance analytics and reporting',
            'Process optimization and enhancement',
            'Additional use case identification',
            'Advanced feature implementation',
            'ROI measurement and reporting'
          ],
          outcomes: [
            'Optimized automation performance',
            'Expanded automation coverage',
            'Continuous improvement culture',
            'Documented ROI achievement'
          ]
        }
      ],

      // Critical success factors
      criticalSuccessFactors: [
        'Strong executive sponsorship and organizational commitment',
        'Comprehensive change management and user training programs',
        'Robust testing and quality assurance throughout implementation',
        'Clear communication and stakeholder engagement strategy',
        'Dedicated project team with appropriate technical expertise'
      ],

      // Risk analysis
      riskAnalysis: [
        {
          category: 'Technical Risk',
          description: 'Integration challenges or technology performance issues',
          probability: 'Medium',
          probabilityColor: '#ffc107',
          impact: 'Medium',
          impactColor: '#ffc107',
          mitigation: 'Comprehensive testing, phased rollout, and technical expertise'
        },
        {
          category: 'Change Management',
          description: 'User resistance or adoption challenges',
          probability: 'Medium',
          probabilityColor: '#ffc107',
          impact: 'High',
          impactColor: '#dc3545',
          mitigation: 'Stakeholder engagement, training, and gradual transition'
        },
        {
          category: 'Implementation Timeline',
          description: 'Project delays affecting ROI realization',
          probability: 'Low',
          probabilityColor: '#28a745',
          impact: 'Medium',
          impactColor: '#ffc107',
          mitigation: 'Experienced implementation team and proven methodologies'
        },
        {
          category: 'Business Continuity',
          description: 'Temporary disruption during implementation',
          probability: 'Low',
          probabilityColor: '#28a745',
          impact: 'Medium',
          impactColor: '#ffc107',
          mitigation: 'Parallel running and rollback procedures'
        }
      ],

      // Technical specifications
      technicalSpecs: [
        {
          component: 'Process Automation Engine',
          technologies: ['Python/Node.js backend', 'REST API architecture', 'Cloud-native deployment'],
          capabilities: ['High-throughput processing', 'Real-time monitoring', 'Scalable architecture'],
          integrationRequirements: 'API-based integration with existing systems, minimal infrastructure changes required'
        },
        {
          component: 'Document Processing Module',
          technologies: ['AI/ML document extraction', 'OCR and NLP capabilities', 'Structured data output'],
          capabilities: ['Multi-format document support', '99%+ accuracy rates', 'Intelligent data validation'],
          integrationRequirements: 'File system or cloud storage integration, existing document workflow compatibility'
        },
        {
          component: 'Workflow Orchestration',
          technologies: ['Business process management', 'Rule engine', 'Exception handling'],
          capabilities: ['Visual workflow design', 'Dynamic routing', 'Audit trail and compliance'],
          integrationRequirements: 'Enterprise system APIs, user authentication integration, reporting dashboard access'
        }
      ],

      // Security framework
      securityFramework: {
        securityMeasures: [
          'End-to-end encryption for all data transmission',
          'Role-based access control and user authentication',
          'Comprehensive audit logging and monitoring',
          'Regular security assessments and penetration testing',
          'Data privacy protection and anonymization capabilities'
        ],
        complianceStandards: [
          'SOC 2 Type II compliance for data security',
          'GDPR compliance for data privacy protection',
          'Industry-specific regulatory requirements',
          'ISO 27001 information security management',
          'Regular compliance audits and certifications'
        ]
      },

      // KPI categories
      kpiCategories: [
        {
          name: 'Operational Efficiency',
          metrics: [
            { name: 'Process Completion Time', description: 'Average time to complete automated processes', target: '85% reduction from baseline' },
            { name: 'Task Throughput', description: 'Number of tasks processed per hour/day', target: '300% increase from current state' },
            { name: 'Error Rate', description: 'Percentage of tasks requiring manual correction', target: '<1% error rate' }
          ]
        },
        {
          name: 'Financial Performance',
          metrics: [
            { name: 'Cost per Transaction', description: 'Average cost to process each task/transaction', target: '70% reduction from baseline' },
            { name: 'ROI Achievement', description: 'Return on automation investment', target: `${Math.round(results.roiPercentage)}% annual ROI` },
            { name: 'Cost Avoidance', description: 'Additional costs avoided through automation', target: '$50K+ annually' }
          ]
        },
        {
          name: 'Quality & Compliance',
          metrics: [
            { name: 'Quality Score', description: 'Overall quality rating of automated processes', target: '95%+ quality score' },
            { name: 'Compliance Rate', description: 'Adherence to regulatory and policy requirements', target: '100% compliance' },
            { name: 'Audit Trail Completeness', description: 'Percentage of transactions with complete audit trails', target: '100% coverage' }
          ]
        }
      ],

      // Performance projections
      performanceProjections: [
        {
          metric: 'Processing Speed',
          current: `${inputs.timePerTask} ${inputs.timeUnit} per task`,
          projected: `${Math.round(inputs.timePerTask * (1 - inputs.automationEfficiency / 100))} ${inputs.timeUnit} per task`,
          improvement: `${Math.round(inputs.automationEfficiency)}% faster`,
          timeline: '3-6 months'
        },
        {
          metric: 'Error Rate',
          current: `${inputs.errorRate}%`,
          projected: `${Math.round(inputs.errorRate * 0.1)}%`,
          improvement: '90% error reduction',
          timeline: '2-4 months'
        },
        {
          metric: 'Cost Efficiency',
          current: `$${Math.round(inputs.hourlyRate * (inputs.timePerTask / 60))} per task`,
          projected: `$${Math.round(inputs.hourlyRate * (inputs.timePerTask / 60) * (1 - inputs.automationEfficiency / 100))} per task`,
          improvement: `${Math.round(inputs.automationEfficiency)}% cost reduction`,
          timeline: '1-3 months'
        },
        {
          metric: 'Throughput Capacity',
          current: `${inputs.tasksPerMonth} tasks/month`,
          projected: `${Math.round(inputs.tasksPerMonth * (1 + inputs.automationEfficiency / 100))} tasks/month`,
          improvement: `${Math.round(inputs.automationEfficiency)}% capacity increase`,
          timeline: '3-6 months'
        }
      ],

      // Strategic benefits
      strategicBenefits: [
        {
          title: 'Enhanced Competitive Position',
          description: 'Faster service delivery and lower operational costs create significant competitive advantages',
          competitiveImpact: 'Market leadership in operational efficiency'
        },
        {
          title: 'Scalability & Growth',
          description: 'Automated processes enable rapid scaling without proportional cost increases',
          competitiveImpact: 'Sustainable growth with improved margins'
        },
        {
          title: 'Employee Satisfaction',
          description: 'Eliminate repetitive tasks, allowing staff to focus on high-value strategic work',
          competitiveImpact: 'Improved talent retention and productivity'
        },
        {
          title: 'Data-Driven Insights',
          description: 'Automated processes generate rich analytics for continuous optimization',
          competitiveImpact: 'Evidence-based decision making capabilities'
        }
      ],

      // Market positioning
      marketPositioning: {
        percentile: 15,
        advantages: [
          'Industry-leading operational efficiency metrics',
          'Reduced time-to-market for new products/services',
          'Enhanced customer experience through faster processing',
          'Lower operational risk through standardized processes',
          'Improved regulatory compliance and audit readiness'
        ]
      },

      // Immediate actions
      immediateActions: [
        'Schedule stakeholder alignment meeting to review automation strategy',
        'Identify and prioritize pilot processes for initial implementation',
        'Assemble cross-functional project team with executive sponsorship',
        'Begin vendor evaluation and technology selection process',
        'Develop detailed project charter and success metrics'
      ],

      // Medium-term objectives
      mediumTermObjectives: [
        'Complete pilot implementation and validate automation approach',
        'Secure additional funding for full-scale deployment if needed',
        'Develop comprehensive change management and training programs',
        'Establish automation center of excellence for ongoing optimization',
        'Identify and plan next phase automation opportunities'
      ],

      // Industry references
      industryReferences: [
        'McKinsey Global Institute automation research and benchmarks',
        'Deloitte Future of Work studies and implementation frameworks',
        'PwC digital transformation success metrics and ROI analysis',
        'Gartner automation technology evaluations and market analysis',
        'Industry-specific automation case studies and best practices'
      ]
    };
  }

  // Enhanced Calculation Methods
  calculateResults(inputData = null) {
    const inputs = inputData || this.getInputValues();
    
    // Use the enhanced input structure
    let timePerTaskHours = inputs.timePerTask;
    if (inputs.timeUnit === 'hours') {
      timePerTaskHours = inputs.timePerTask;
    } else {
      timePerTaskHours = inputs.timePerTask / 60; // Convert minutes to hours
    }

    // Use tasksPerMonth for calculations (already converted)
    let tasksPerYear = inputs.tasksPerMonth * 12;

    // Calculate automation impact
    const automationEfficiency = inputs.automationEfficiency / 100;
    const timesSavedPerTask = timePerTaskHours * automationEfficiency;
    const totalTimesSavedAnnually = tasksPerYear * timesSavedPerTask * inputs.employeesAffected;
    const annualLaborSavings = totalTimesSavedAnnually * inputs.hourlyRate;
    
    // Error reduction calculation
    const currentErrorRate = inputs.errorRate / 100;
    const errorsAnnually = tasksPerYear * currentErrorRate * inputs.employeesAffected;
    const errorReductionRate = 0.9; // 90% error reduction from automation
    const errorsReduced = errorsAnnually * errorReductionRate;
    const reworkCostPerError = timePerTaskHours * inputs.hourlyRate * 0.5; // 50% of original task time
    const errorReductionSavings = errorsReduced * reworkCostPerError;

    // Total savings and ROI
    const totalAnnualSavings = annualLaborSavings + errorReductionSavings;
    const implementationCost = inputs.implementationCost || 0;
    const netAnnualBenefit = totalAnnualSavings - (implementationCost / 3); // Amortize over 3 years
    
    // Calculate ROI properly: ((3-year savings - implementation cost) / implementation cost) * 100
    // This prevents negative ROI values for realistic scenarios
    let roiPercentage = 0;
    if (implementationCost > 0) {
      const threeYearSavings = totalAnnualSavings * 3;
      roiPercentage = ((threeYearSavings - implementationCost) / implementationCost) * 100;
      // Ensure minimum ROI is 0% for display purposes
      roiPercentage = Math.max(roiPercentage, 0);
    } else {
      // If no implementation cost, show savings as infinite ROI, but cap at reasonable number
      roiPercentage = totalAnnualSavings > 0 ? 999 : 0;
    }
    
    const breakevenMonths = implementationCost > 0 && totalAnnualSavings > 0 ? 
      Math.ceil(implementationCost / (totalAnnualSavings / 12)) : 0;

    // Productivity calculations
    const currentProductiveHours = inputs.employeesAffected * 2000; // Annual hours per employee
    const productivityIncrease = (totalTimesSavedAnnually / currentProductiveHours) * 100;

    const results = {
      annualSavings: totalAnnualSavings,
      monthlySavings: totalAnnualSavings / 12,
      timesSavedAnnually: totalTimesSavedAnnually,
      timesSavedWeekly: totalTimesSavedAnnually / 52,
      timesSavedDaily: totalTimesSavedAnnually / 250,
      productivityIncrease: productivityIncrease,
      roiPercentage: roiPercentage,
      breakevenMonths: breakevenMonths,
      tasksAutomatedAnnually: tasksPerYear * inputs.employeesAffected,
      laborSavings: annualLaborSavings,
      errorSavings: errorReductionSavings,
      netBenefit: netAnnualBenefit,
      errorsReduced: errorsReduced,
      errorsAfterAutomation: errorsAnnually - errorsReduced,
      implementationCost: implementationCost,
      // Additional properties for compatibility
      totalAnnualBenefit: totalAnnualSavings,
      currentErrorsAnnually: errorsAnnually,
      errorReductionPercent: errorReductionRate * 100
    };
    
    return results;
  }

  // Enhanced UI Updates
  updateResults(results) {
    // Main metrics
    document.getElementById('annual-savings').textContent = this.formatValue(results.annualSavings, 'currency');
    document.getElementById('monthly-savings').textContent = this.formatValue(results.monthlySavings, 'currency') + '/month';
    document.getElementById('time-saved-annually').textContent = new Intl.NumberFormat('en-US').format(Math.round(results.timesSavedAnnually));
    document.getElementById('time-saved-weekly').textContent = Math.round(results.timesSavedWeekly) + ' hrs/week';
    document.getElementById('productivity-increase').textContent = Math.round(results.productivityIncrease) + '%';
    document.getElementById('roi-percentage').textContent = Math.round(results.roiPercentage) + '%';
    document.getElementById('tasks-automated-annually').textContent = new Intl.NumberFormat('en-US').format(results.tasksAutomatedAnnually) + ' tasks/year';
    document.getElementById('breakeven-time').textContent = `Breakeven in ${Math.round(results.breakevenMonths)} months`;

    // Enhanced context
    const fulltimeEquivalent = Math.round(results.timesSavedAnnually / 2000 * 10) / 10;
    const timeContext = document.getElementById('time-context');
    if (timeContext) {
      timeContext.textContent = `Equivalent to ${fulltimeEquivalent} full-time employee${fulltimeEquivalent !== 1 ? 's' : ''}`;
    }

    const productivityContext = document.getElementById('productivity-context');
    if (productivityContext) {
      const savedHours = Math.round(results.timesSavedWeekly);
      productivityContext.textContent = `${savedHours} hours/week for strategic work`;
    }

    // Detailed breakdown
    document.getElementById('time-per-task-saved').textContent = `${Math.round(results.timesSavedAnnually / results.tasksAutomatedAnnually * 60)} minutes`;
    document.getElementById('daily-time-saved').textContent = `${Math.round(results.timesSavedDaily)} hours`;
    document.getElementById('weekly-time-saved').textContent = `${Math.round(results.timesSavedWeekly)} hours`;
    document.getElementById('labor-savings').textContent = this.formatValue(results.laborSavings, 'currency');
    document.getElementById('net-benefit').textContent = this.formatValue(results.netBenefit, 'currency');

    // Error-related updates
    if (results.errorSavings > 0) {
      document.getElementById('error-cost-row').style.display = 'flex';
      document.getElementById('error-savings').textContent = this.formatValue(results.errorSavings, 'currency');
      document.getElementById('quality-impact').style.display = 'block';
      document.getElementById('current-errors').textContent = Math.round(results.errorsReduced + results.errorsAfterAutomation);
      document.getElementById('errors-after-automation').textContent = Math.round(results.errorsAfterAutomation);
      document.getElementById('error-reduction-percent').textContent = Math.round((results.errorsReduced / (results.errorsReduced + results.errorsAfterAutomation)) * 100) + '%';
    }

    // Implementation cost
    if (results.implementationCost > 0) {
      document.getElementById('implementation-cost-row').style.display = 'flex';
      document.getElementById('implementation-investment').textContent = this.formatValue(results.implementationCost, 'currency');
    }

    // Update trends and confidence indicators
    this.updateTrendIndicators(results);
  }

  calculateBaselineComparison(results) {
    // Calculate baseline scenario (current state without automation)
    const inputs = this.getInputValues();
    
    // Debug logging
    console.log('calculateBaselineComparison inputs:', inputs);
    console.log('calculateBaselineComparison results:', results);
    
    // Baseline calculation: current costs without automation
    let timePerTaskHours = inputs.timePerTask;
    if (inputs.timeUnit === 'hours') {
      timePerTaskHours = inputs.timePerTask;
    } else {
      timePerTaskHours = inputs.timePerTask / 60; // Convert minutes to hours
    }
    
    const tasksPerYear = inputs.tasksPerMonth * 12;
    const baselineCostPerYear = tasksPerYear * timePerTaskHours * inputs.hourlyRate * inputs.employeesAffected;
    
    console.log('Baseline calculation:', {
      timePerTaskHours,
      tasksPerYear,
      baselineCostPerYear,
      annualSavings: results.annualSavings
    });
    
    // Calculate improvement percentage vs baseline
    if (baselineCostPerYear > 0 && results.annualSavings > 0) {
      const improvementPercentage = Math.round((results.annualSavings / baselineCostPerYear) * 100);
      console.log('Improvement percentage:', improvementPercentage);
      return Math.min(improvementPercentage, 999); // Cap at 999% for display
    }
    
    console.log('Returning 0 - no valid baseline or savings');
    return 0;
  }

  updateTrendIndicators(results) {
    const savingsTrend = document.getElementById('savings-trend');
    if (savingsTrend) {
      // Calculate baseline comparison percentage
      const baselineComparison = this.calculateBaselineComparison(results);
      savingsTrend.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" class="trend-up">
          <path d="M2 8L6 4l4 4" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span class="trend-text">+${baselineComparison}% vs baseline</span>
      `;
    }

    // Update confidence based on data completeness
    const inputs = this.getInputValues();
    let confidence = 60; // Base confidence
    
    if (inputs.errorRate > 0) confidence += 10;
    if (inputs.implementationCost > 0) confidence += 15;
    if (inputs.automationEfficiency !== 85) confidence += 10; // Custom efficiency
    if (inputs.employeesAffected >= 5) confidence += 5;
    
    confidence = Math.min(confidence, 95);
    
    const confidenceFill = document.querySelector('.confidence-fill');
    const confidenceText = document.querySelector('.confidence-text');
    
    if (confidenceFill) {
      confidenceFill.style.width = `${confidence}%`;
    }
    if (confidenceText) {
      confidenceText.textContent = `${confidence}% confidence`;
    }
  }

  loadInputValues(data) {
    // Map the data properties to form elements
    const mappings = {
      'tasksPerPeriod': 'tasks-per-period',
      'timePerTask': 'time-per-task',
      'hourlyRate': 'hourly-rate',
      'employeesAffected': 'employees-affected',
      'errorRate': 'error-rate',
      'automationEfficiency': 'automation-efficiency',
      'implementationCost': 'implementation-cost',
      'taskFrequency': 'task-frequency',
      'timeUnit': 'time-unit'
    };

    Object.keys(mappings).forEach(dataKey => {
      if (data[dataKey] !== undefined) {
        const elementId = mappings[dataKey];
        const element = document.getElementById(elementId);
        if (element) {
          element.value = data[dataKey];
          // Sync slider if it exists
          if (elementId !== 'task-frequency' && elementId !== 'time-unit') {
            this.syncSlider(elementId);
          }
        }
      }
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not exists
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem;
          border-radius: var(--border-radius);
          background: white;
          border: 1px solid #ddd;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideIn 0.3s ease-out;
        }
        .notification-success { border-color: #22c55e; color: #16a34a; }
        .notification-warning { border-color: #f59e0b; color: #d97706; }
        .notification-error { border-color: #ef4444; color: #dc2626; }
        .notification button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Validation and Error Handling
  validateInputs() {
    const inputs = this.getInputValues();
    const errors = [];

    if (inputs.tasksPerPeriod <= 0) {
      errors.push('Number of tasks must be greater than 0');
    }
    if (inputs.timePerTask <= 0) {
      errors.push('Time per task must be greater than 0');
    }
    if (inputs.hourlyRate <= 0) {
      errors.push('Hourly rate must be greater than 0');
    }
    if (inputs.employeesAffected <= 0) {
      errors.push('Number of employees must be greater than 0');
    }
    if (inputs.automationEfficiency < 0 || inputs.automationEfficiency > 100) {
      errors.push('Automation efficiency must be between 0 and 100%');
    }

    return errors;
  }

  showValidationErrors(errors) {
    let container = document.getElementById('validation-errors');
    
    if (!container) {
      // Create error container if it doesn't exist
      const errorDiv = document.createElement('div');
      errorDiv.id = 'validation-errors';
      errorDiv.className = 'validation-errors';
      errorDiv.style.cssText = `
        background-color: #fee;
        border: 1px solid #fcc;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
        color: #c33;
      `;
      
      const resultsPanel = document.getElementById('results-panel');
      if (resultsPanel) {
        resultsPanel.insertBefore(errorDiv, resultsPanel.firstChild);
        container = errorDiv;
      } else {
        // If results panel doesn't exist, try to find calculator wrapper
        const calculatorWrapper = document.querySelector('.calculator-wrapper');
        if (calculatorWrapper) {
          calculatorWrapper.appendChild(errorDiv);
          container = errorDiv;
        } else {
          console.warn('Could not find a place to insert validation errors');
          return;
        }
      }
    }

    if (container && errors.length > 0) {
      container.innerHTML = `
        <div class="error-message">
          <h4>Please fix the following issues:</h4>
          <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        </div>
      `;
      container.style.display = 'block';
    } else if (container) {
      container.style.display = 'none';
    }
  }

  // Enhanced calculation with validation
  calculateWithValidation() {
    const errors = this.validateInputs();
    this.showValidationErrors(errors);
    
    if (errors.length === 0) {
      this.performCalculationWithLoading();
    } else {
      // Show empty results if there are validation errors
      this.displayResults({});
      this.updateProgressIndicators();
    }
  }

  // Loading state management
  showLoadingState() {
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) {
      resultsPanel.classList.add('calculating');
    }
  }

  hideLoadingState() {
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) {
      resultsPanel.classList.remove('calculating');
    }
  }

  // Enhanced calculate with loading state
  performCalculationWithLoading() {
    this.showLoadingState();
    
    // Simulate some processing time for better UX
    setTimeout(() => {
      this.performCalculation();
      this.hideLoadingState();
    }, 300);
  }

  // Debounced calculation for better performance
  setupDebouncedCalculate() {
    this.debouncedCalculate = this.debounce(() => {
      this.calculate();
    }, 500);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Enhanced input binding with debouncing
  bindInputsWithDebouncing() {
    const inputs = [
      'tasks-per-period', 'time-per-task', 'hourly-rate', 'employees-affected',
      'error-rate', 'automation-efficiency', 'implementation-cost'
    ];
    
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          this.syncSlider(id);
          this.debouncedCalculate();
        });
      }
    });
  }

  // Initialize enhanced features
  initEnhancements() {
    // Replace regular input binding with debounced version
    this.bindInputsWithDebouncing();
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Initialize tooltips
    this.initTooltips();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to calculate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.calculate();
      }
      
      // Ctrl/Cmd + R to reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.resetCalculator();
      }
    });
  }

  initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, e.target.dataset.tooltip);
      });
      
      trigger.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    tooltip.style.zIndex = '1001';
  }

  hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  resetCalculator() {
    // Reset all inputs to default values
    document.getElementById('tasks-per-period').value = '';
    document.getElementById('time-per-task').value = '';
    document.getElementById('hourly-rate').value = '';
    document.getElementById('employees-affected').value = '';
    document.getElementById('error-rate').value = 0;
    document.getElementById('automation-efficiency').value = 85;
    document.getElementById('implementation-cost').value = '';
    
    // Reset dropdowns
    document.getElementById('industry-preset').value = '';
    document.getElementById('task-frequency').value = 'monthly';
    document.getElementById('time-unit').value = 'minutes';
    
    // Sync all sliders
    this.syncSlider('tasks-per-period');
    this.syncSlider('time-per-task');
    this.syncSlider('hourly-rate');
    this.syncSlider('employees-affected');
    this.syncSlider('error-rate');
    this.syncSlider('automation-efficiency');
    
    // Reset scenarios
    this.resetScenarios();
    
    // Recalculate
    this.calculate();
    
    this.showNotification('Calculator reset successfully', 'success');
  }

  // ...existing code...
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Wait a bit for all scripts to load
    setTimeout(() => {
      const calculator = new AutomationCalculator();
      
      // Make calculator available globally for debugging
      window.calculator = calculator;
      
      // Force a calculation after a short delay
      setTimeout(() => {
        calculator.setDefaultValues();
        calculator.calculate();
      }, 500);
    }, 100);
  } catch (error) {
    console.error('Error creating AutomationCalculator:', error);
    console.error('Stack trace:', error.stack);
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutomationCalculator;
}
