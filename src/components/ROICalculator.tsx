import { useState, useMemo } from 'react';
import { Calculator, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const ROICalculator = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyValue, setHourlyValue] = useState(50);

  const calculations = useMemo(() => {
    const weeksPerYear = 52;
    const hoursPerYear = hoursPerWeek * weeksPerYear;
    const annualValueSaved = hoursPerYear * hourlyValue;
    const prAgencyMonthly = 5000;
    const prAgencyAnnual = prAgencyMonthly * 12;
    const savingsVsAgency = prAgencyAnnual - (449 * 12); // vs Momentum plan

    return {
      hoursPerYear,
      annualValueSaved,
      savingsVsAgency,
    };
  }, [hoursPerWeek, hourlyValue]);

  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">ROI Calculator</h3>
          <p className="text-sm text-muted-foreground">See your potential savings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hours/week on outreach</Label>
              <span className="text-lg font-bold text-primary">{hoursPerWeek}h</span>
            </div>
            <Slider
              value={[hoursPerWeek]}
              onValueChange={(val) => setHoursPerWeek(val[0])}
              min={1}
              max={40}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>40h</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Your hourly value</Label>
              <span className="text-lg font-bold text-primary">${hourlyValue}</span>
            </div>
            <Slider
              value={[hourlyValue]}
              onValueChange={(val) => setHourlyValue(val[0])}
              min={25}
              max={500}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$25</span>
              <span>$500</span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-success/10 rounded-xl p-4 border border-success/20">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Value Saved</p>
                <p className="text-2xl font-bold text-foreground">${calculations.annualValueSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Reclaimed</p>
                <p className="text-2xl font-bold text-foreground">{calculations.hoursPerYear.toLocaleString()} hours/year</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Savings vs PR Agency ($5k/mo)</p>
                <p className="text-2xl font-bold text-foreground">${calculations.savingsVsAgency.toLocaleString()}/year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Comparison based on Momentum plan at $449/mo vs traditional PR agency at $5,000/mo
      </p>
    </div>
  );
};

export default ROICalculator;
