document.addEventListener('DOMContentLoaded', () => {
    const spinButton = document.getElementById('spinButton');
    const addColumnButton = document.getElementById('addColumn');
    const removeColumnButton = document.getElementById('removeColumn');
    const slotContainer = document.querySelector('.slot-container');
    const resultsContainer = document.querySelector('.results-container');
    
    let slotCount = 1;
    const itemsPerSlot = 20;
    const overshootEffectPercentage = 0.6;
    let isSpinning = false;

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const updateSpinButtonWidth = () => {
        const totalSlotsWidth = slotCount * 110;
        const newButtonWidth = totalSlotsWidth * 0.66;
        spinButton.style.width = `${newButtonWidth}px`;
    };

    const createColumn = (id) => {
        // Create the slot element
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.id = `slot${id}`;
        const values = document.createElement('div');
        values.className = 'values';
        for (let i = 0; i < itemsPerSlot / 2; i++) {
            const divH = document.createElement('div'); divH.textContent = 'H'; values.appendChild(divH);
            const divT = document.createElement('div'); divT.textContent = 'T'; values.appendChild(divT);
        }
        slot.appendChild(values);
        slotContainer.appendChild(slot);

        // Create the corresponding result text element
        const resultText = document.createElement('div');
        resultText.className = 'result-text';
        resultText.id = `result-text-${id}`;
        
        // --- THIS IS THE FIX ---
        // Set the initial text to match the default visual state ('H')
        resultText.textContent = 'Heads';
        // Make the text visible immediately
        resultText.style.opacity = '1';
        
        resultsContainer.appendChild(resultText);
    };

    const removeColumn = () => {
        if (slotCount > 1) {
            const lastSlot = document.getElementById(`slot${slotCount}`);
            const lastResultText = document.getElementById(`result-text-${slotCount}`);
            if (lastSlot) slotContainer.removeChild(lastSlot);
            if (lastResultText) resultsContainer.removeChild(lastResultText);
            slotCount--;
            updateSpinButtonWidth();
        }
    };

    addColumnButton.addEventListener('click', () => {
        slotCount++;
        createColumn(slotCount);
        updateSpinButtonWidth();
    });

    removeColumnButton.addEventListener('click', removeColumn);

    spinButton.addEventListener('click', () => {
        if (isSpinning) {
            return;
        }
        isSpinning = true;

        spinButton.disabled = true;
        addColumnButton.disabled = true;
        removeColumnButton.disabled = true;

        const slots = document.querySelectorAll('.slot');
        const resultTexts = document.querySelectorAll('.result-text');
        const finalResults = [];
        const options = ['H', 'T'];
        
        let maxAnimationTime = 0;

        const specialEffectIndices = new Set();
        if (slots.length >= 2) {
            const numToAffect = Math.ceil(slots.length * overshootEffectPercentage);
            const indices = Array.from(Array(slots.length).keys());
            shuffleArray(indices);
            for (let i = 0; i < numToAffect; i++) {
                specialEffectIndices.add(indices[i]);
            }
        }

        resultTexts.forEach(textEl => {
            textEl.style.opacity = '0';
            textEl.textContent = '\u00A0';
        });

        slots.forEach((slot, index) => {
            const valuesContainer = slot.querySelector('.values');
            
            const duration = Math.random() * 1500 + 2500;
            const startDelay = Math.random() * 500;
            let settleTime = 0;

            const randomChoice = Math.floor(Math.random() * 2);
            const result = options[randomChoice];
            finalResults.push(result);
            const targetIndex = (itemsPerSlot - 2) + randomChoice;
            const finalTargetY = targetIndex * 150;

            valuesContainer.style.transition = 'none';
            valuesContainer.style.transform = 'translateY(0)';
            slot.offsetHeight;

            valuesContainer.style.transition = `transform ${duration / 1000}s ease-out`;

            if (specialEffectIndices.has(index)) {
                const itemHeight = 150;
                const baseOvershoot = 0.30;
                const randomOvershootPercent = baseOvershoot + (Math.random() - 0.5) * (baseOvershoot * 0.2);
                const overshootAmount = itemHeight * randomOvershootPercent;
                const overshootTargetY = finalTargetY + overshootAmount;
                settleTime = Math.random() * 100 + 400;

                setTimeout(() => {
                    valuesContainer.style.transform = `translateY(-${overshootTargetY}px)`;
                }, startDelay);

                setTimeout(() => {
                    valuesContainer.style.transition = `transform ${settleTime / 1000}s ease-out`;
                    valuesContainer.style.transform = `translateY(-${finalTargetY}px)`;
                }, startDelay + duration);
            } else {
                setTimeout(() => {
                    valuesContainer.style.transform = `translateY(-${finalTargetY}px)`;
                }, startDelay);
            }

            const totalAnimationTime = duration + settleTime;
            maxAnimationTime = Math.max(maxAnimationTime, startDelay + totalAnimationTime);
            
            setTimeout(() => {
                const resultTextElement = resultTexts[index];
                if (resultTextElement) {
                    resultTextElement.textContent = result === 'H' ? 'Heads' : 'Tails';
                    resultTextElement.style.opacity = '1';
                }
            }, startDelay + totalAnimationTime);
        });

        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            addColumnButton.disabled = false;
            removeColumnButton.disabled = false;
        }, maxAnimationTime);

        console.log('Final Results:', finalResults);
    });

    // Initial setup on page load
    createColumn(1);
    updateSpinButtonWidth();
});