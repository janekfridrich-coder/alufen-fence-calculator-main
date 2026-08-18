import React, { useState, useEffect } from 'react';
import { CuttingPlan } from '@/lib/localDb';
import { motion, AnimatePresence } from 'framer-motion';
import FenceTypeSelector, { DEFAULT_PACKAGE_LENGTH } from '@/components/calculator/FenceTypeSelector';
import FenceInputForm from '@/components/calculator/FenceInputForm';
import CuttingPlanResult from '@/components/calculator/CuttingPlanResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Layers, History, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

export default function CalculatorPage() {
const [step, setStep] = useState(1);
const [fenceType, setFenceType] = useState(null); // '2D' or '3D'
const [fences, setFences] = useState([]);
const [result, setResult] = useState(null);
const [customerName, setCustomerName] = useState('');
const [packageLengths, setPackageLengths] = useState([DEFAULT_PACKAGE_LENGTH]);
const { logout } = useAuth();

// Load plan from URL if planId is present
useEffect(() => {
const urlParams = new URLSearchParams(window.location.search);
const planId = urlParams.get('planId');
if (planId) {
CuttingPlan.get(planId).then(plan => {
if (plan) {
const parsedFences = plan.fences.map(f => typeof f === 'string' ? JSON.parse(f) : f);
setFenceType(plan.fence_type);
setFences(parsedFences);
setResult(plan.result);
setStep(3);
}
});
}
}, []);

const handleTypeSelect = (type) => {
setFenceType(type);
setStep(2);
};

const handleFencesSubmit = (fenceData, name) => {
setFences(fenceData);
if (name !== undefined) setCustomerName(name);
const calculatedResult = calculateCuttingPlan(fenceData, fenceType, packageLengths);
setResult(calculatedResult);
setStep(3);
};

const handleSave = async (name) => {
await CuttingPlan.create({
name,
fence_type: fenceType,
fences: fences.map(f => JSON.stringify(f)),
result
});
};

const handleReset = () => {
setStep(1);
setFenceType(null);
setFences([]);
setResult(null);
};

const handleBack = () => {
if (step === 2) {
setStep(1);
setFenceType(null);
} else if (step === 3) {
setStep(2);
setResult(null);
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
<div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
{/* Header */}
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
className="text-center mb-12"
>
<div className="inline-flex items-center gap-3 mb-4">
<div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
<Layers className="w-6 h-6 text-white" />
</div>
<h1 className="text-3xl md:text-4xl font-bold text-slate-800">
Alufen System
</h1>
</div>
<p className="text-slate-500 text-lg">
Kalkulačka lamel pro hliníkové ploty
</p>
<div className="mt-4 flex items-center justify-center gap-2">
<Link to={createPageUrl('History')}>
<Button variant="ghost" size="sm" className="gap-2 text-slate-500">
<History className="w-4 h-4" />
Historie výpočtů
</Button>
</Link>
<Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-slate-500">
<LogOut className="w-4 h-4" />
Odhlásit se
</Button>
</div>
</motion.div>

{/* Progress Steps */}
<div className="flex justify-center mb-10">
<div className="flex items-center gap-2 md:gap-4">
{[1, 2, 3].map((s) => (
<React.Fragment key={s}>
<div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
step >= s
? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
: 'bg-slate-200 text-slate-400'
}`}>
{s}
</div>
{s < 3 && (
<div className={`w-12 md:w-24 h-1 rounded-full transition-all duration-300 ${
step > s ? 'bg-emerald-500' : 'bg-slate-200'
}`} />
)}
</React.Fragment>
))}
</div>
</div>

{/* Back Button */}
{step > 1 && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
className="mb-6"
>
<Button
variant="ghost"
onClick={handleBack}
className="text-slate-600 hover:text-slate-800"
>
<ArrowLeft className="w-4 h-4 mr-2" />
Zpět
</Button>
</motion.div>
)}

{/* Content */}
<AnimatePresence mode="wait">
{step === 1 && (
<motion.div
key="step1"
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
>
<FenceTypeSelector
onSelect={handleTypeSelect}
packageLengths={packageLengths}
onPackageLengthsChange={setPackageLengths}
/>
</motion.div>
)}

{step === 2 && (
<motion.div
key="step2"
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
>
<FenceInputForm
fenceType={fenceType}
onSubmit={handleFencesSubmit}
initialFences={fences}
initialCustomerName={customerName}
/>
</motion.div>
)}

{step === 3 && result && (
<motion.div
key="step3"
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
>
<CuttingPlanResult
result={result}
fences={fences}
fenceType={fenceType}
customerName={customerName}
onReset={handleReset}
onSave={handleSave}
/>
</motion.div>
)}
</AnimatePresence>
</div>
</div>
);
}

// Gap calculation functions
function calculateGaps(height, fenceType) {
const divisor = fenceType === '2D' ? 112 : 106;

const normalLamellas = Math.floor(height / divisor);
const smallerLamellas = normalLamellas + 1;
const biggerLamellas = normalLamellas - 1;

// Normal gap: [(height - (divisor × floor(height/divisor))) / (floor(height/divisor) - 1)] / 10
const normalGap = ((height - (divisor * normalLamellas)) / (normalLamellas - 1)) / 10;

// Smaller gap (more lamellas): [(height - (106 × (floor(height/106) + 1))) / floor(height/106)] / 10
const smallerGap = ((height - (106 * smallerLamellas)) / (smallerLamellas - 1)) / 10;

// Bigger gap (fewer lamellas): [(height - (106 × (floor(height/106) - 1))) / (floor(height/106) - 2)] / 10
const biggerGap = biggerLamellas > 1
? ((height - (106 * biggerLamellas)) / (biggerLamellas - 2)) / 10
: null;

return {
normal: {
gap: Math.round(normalGap * 10) / 10,
lamellas: normalLamellas,
label: 'Normal'
},
smaller: {
gap: Math.round(smallerGap * 10) / 10,
lamellas: smallerLamellas,
label: 'Smaller Gap'
},
bigger: biggerGap !== null && biggerLamellas > 1 ? {
gap: Math.round(biggerGap * 10) / 10,
lamellas: biggerLamellas,
label: 'Bigger Gap'
} : null
};
}

// Cutting plan optimization
function calculateCuttingPlan(fences, fenceType, packageLengths = [6500]) {
const LAMELLAS_PER_PACKAGE = 4;

// Collect all required cuts with their quantities
const cuts = {};
const profiles = {};

fences.forEach(fence => {
const width = parseInt(fence.width);
const height = parseInt(fence.height);
const quantity = fence.quantity;
const lamellas = fence.selectedGap.lamellas;
const totalLamellas = lamellas * quantity;

// Lamellas (cut to width)
cuts[width] = (cuts[width] || 0) + totalLamellas;

// Profiles (cut to height) - 2 per fence
profiles[height] = (profiles[height] || 0) + (2 * quantity);
});

// Optimize cutting plan for lamellas
const lamellaPlan = optimizeCuts(cuts, packageLengths, LAMELLAS_PER_PACKAGE);

// Optimize cutting plan for profiles
const profilePlan = optimizeCuts(profiles, packageLengths, LAMELLAS_PER_PACKAGE);

return {
lamellaPlan,
profilePlan,
summary: {
totalLamellaPackages: lamellaPlan.packages.length,
totalProfilePackages: profilePlan.packages.length,
totalLamellaWaste: lamellaPlan.totalWaste,
totalProfileWaste: profilePlan.totalWaste,
cuts,
profiles
}
};
}

function optimizeCuts(requirements, packageLengthsInput, lamellasPerPackage) {
const availableLengths = Array.isArray(packageLengthsInput)
? packageLengthsInput.sort((a, b) => b - a)
: [packageLengthsInput];

const cutLengths = Object.keys(requirements).map(Number).sort((a, b) => b - a);

const cutsNeeded = {};
cutLengths.forEach(l => {
cutsNeeded[l] = Math.ceil(requirements[l] / lamellasPerPackage);
});

let allCuts = [];
cutLengths.forEach(l => {
for (let i = 0; i < cutsNeeded[l]; i++) {
allCuts.push(l);
}
});

allCuts.sort((a, b) => b - a);

// Each bin has a chosen package length
const bins = []; // { cuts: [], used: 0, pkgLength: number }

for (const cutLength of allCuts) {
// Find best existing bin that fits this cut with least waste
let bestBinIdx = -1;
let bestRemaining = Infinity;

for (let i = 0; i < bins.length; i++) {
const remaining = bins[i].pkgLength - bins[i].used;
if (remaining >= cutLength && remaining < bestRemaining) {
bestRemaining = remaining;
bestBinIdx = i;
}
}

if (bestBinIdx >= 0) {
bins[bestBinIdx].cuts.push(cutLength);
bins[bestBinIdx].used += cutLength;
} else {
// Open new bin: pick the smallest available length that fits this cut
const chosenLength = availableLengths.filter(l => l >= cutLength).pop() || availableLengths[0];
bins.push({ cuts: [cutLength], used: cutLength, pkgLength: chosenLength });
}
}

let totalWaste = 0;
const packages = bins.map(bin => {
const waste = bin.pkgLength - bin.used;
totalWaste += waste;
const cutMap = {};
bin.cuts.forEach(len => { cutMap[len] = (cutMap[len] || 0) + 1; });
const cuts = Object.entries(cutMap).map(([length, count]) => ({
length: parseInt(length),
count: count * lamellasPerPackage
}));
return { cuts, waste, rawCuts: bin.cuts, pkgLength: bin.pkgLength };
});

return { packages, totalWaste };
}

export { calculateGaps };
