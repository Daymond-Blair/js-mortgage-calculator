// declare state of form, this holds all current information like memory card
let state = {
	price: getNumber(document.querySelectorAll('[name = "price"]')[0].value),
	loan_years: document.querySelectorAll('[name = "loan_years"]')[0].value,
	down_payment: document.querySelectorAll('[name = "down_payment"]')[0].value,
	interest_rate: document.querySelectorAll('[name = "interest_rate"]')[0].value,
	property_tax: document.querySelectorAll('[name = "property_tax"]')[0].value,
	home_insurance: document.querySelectorAll('[name = "home_insurance"]')[0]
		.value,
	hoa: document.querySelectorAll('[name = "hoa"]')[0].value,
}

// declare variables
let totalLoan,
	totalMonths,
	monthlyInterest,
	monthlyPrincipalInterest,
	monthlyPropertyTaxes,
	monthlyHomeInsurance,
	monthlyHOA,
	monthlyTotal,
	labels = ['Principal & Interest', 'Property Tax', 'Home Insurance', 'HOA'],
	backgroundColor = [
		'rgba(255, 99, 132, 1)',
		'rgba(54, 162, 235, 1)',
		'rgba(255, 206, 86, 1)',
		'rgba(75, 192, 192, 1)',
		'rgba(153, 102, 255, 1)',
		'rgba(255, 159, 64, 1)',
	],
	borderColor = [
		'rgba(255, 99, 132, 1)',
		'rgba(54, 162, 235, 1)',
		'rgba(255, 206, 86, 1)',
		'rgba(75, 192, 192, 1)',
		'rgba(153, 102, 255, 1)',
		'rgba(255, 159, 64, 1)',
	]

// ***** INPUT VALIDATION *****
// scrub input to remove characters and only return numbers
function getNumber(str) {
	return Number(str.replace(/[^0-9\.-]+/g, ''))
}

// ***** CHART.JS *****
// initialize chart.js
let ctx = document.getElementById('myChart').getContext('2d')
let myChart = new Chart(ctx, {
	type: 'doughnut',
	data: {
		labels: labels,
		datasets: [
			{
				label: '# of Votes',
				data: [
					monthlyPrincipalInterest,
					monthlyPropertyTaxes,
					monthlyHomeInsurance,
					monthlyHOA,
				],
				backgroundColor: backgroundColor,
				borderColor: borderColor,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
})

// turn off animations so that dynamic sliders don't break chart
myChart.options.animation = false

// grab all inputs
let inputTexts = document.getElementsByClassName('form-group__textInput')

let inputSlides = document.getElementsByClassName('form-group__range-slide')

// iterate over inputs and attach event listeners to each

// for (let i = 0; i < inputTexts.length; i++) {
// 	console.log(inputTexts[i])
// }

for (input of inputTexts) {
	input.addEventListener('input', updateInputState)
}

console.log('--------')

for (input of inputSlides) {
	input.addEventListener('input', updateInputState)
}

// ***** STATE *****
function updateInputState(event) {
	let name = event.target.name
	let value = event.target.value

	if (name == 'price') {
		value = getNumber(value)
	}

	// TODO : look into this if statement to see where it should be used
	if (event.target.type == 'range') {
		let total = (document.getElementsByClassName(
			`total__${name}`,
		)[0].innerHTML = `${value}`)
	}

	state = {
		...state,
		[name]: value,
	}

	calculateData()
	console.log(name + ':' + ' ' + value)
	console.log(state)
}

// ***** SHOW CHART RESULTS *****
document.getElementsByTagName('form')[0].addEventListener('submit', (event) => {
	event.preventDefault()
	document
		.getElementsByClassName('mg-page__right')[0]
		.classList.add('mg-page__right--animate')
	calculateData()
})

// ***** CALCULATIONS *****
function calculateData() {
	let totalLoan = state.price - state.price * (state.down_payment / 100)
	let totalMonths = state.loan_years * 12
	let monthlyInterest = state.interest_rate / (100 / 12)
	// debugger
	let monthlyPrincipalInterest = (
		totalLoan *
		((monthlyInterest * (1 + monthlyInterest) ** totalMonths) /
			((1 + monthlyInterest) ** totalMonths - 1))
	).toFixed(2)

	monthlyPropertyTaxes = (
		(state.price * (state.property_tax / 100)) /
		12
	).toFixed(2)

	monthlyHomeInsurance = state.home_insurance / 12
	monthlyHOA = state.hoa / 12
	monthlyTotal =
		parseFloat(monthlyPrincipalInterest) +
		parseFloat(monthlyPropertyTaxes) +
		parseFloat(monthlyHomeInsurance) +
		parseFloat(monthlyHOA)

	// update chart elements to display calculations
	// interest
	document.getElementsByClassName('info__numbers--principal')[0].innerHTML =
		parseFloat(monthlyPrincipalInterest).toFixed(2)

	// property taxes
	document.getElementsByClassName(
		'info__numbers--property_taxes',
	)[0].innerHTML = parseFloat(monthlyPropertyTaxes).toFixed(2)

	// home insurance
	document.getElementsByClassName(
		'info__numbers--home_insurance',
	)[0].innerHTML = parseFloat(monthlyHomeInsurance).toFixed(2)

	// home owners association (hoa)
	document.getElementsByClassName('info__numbers--hoa')[0].innerHTML =
		parseFloat(monthlyHOA).toFixed(2)

	// total
	document.getElementsByClassName('info__numbers--total')[0].innerHTML =
		monthlyTotal.toFixed(2)

	updateChart(myChart, labels, backgroundColor)
}

// ***** UPDATE CHART *****
function updateChart(chart, label, color) {
	chart.data.datasets.pop()
	chart.data.datasets.push({
		label: label,
		backgroundColor: color,
		// TODO debug monthly principal interest - not updating on chart properly
		data: [
			monthlyPrincipalInterest,
			monthlyPropertyTaxes,
			monthlyHomeInsurance,
			monthlyHOA,
		],
	})

	chart.options.transitions.active.animation.duration = 0
	chart.update()
}

// run calculations
calculateData()
