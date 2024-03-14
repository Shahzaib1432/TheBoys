<script>

</script>

<main>
	<div class="background"        style="position: fixed; z-index: -1;"/>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="maintext">What Are the Boys AKA Homies?</label>
	<table class="datatable" style="z-index: 100;">
		<tr>
			<th>&nbsp; &nbsp; &nbsp; Classic Image &nbsp; &nbsp; &nbsp;</th>
			<th>Iconic Name</th>
			<th>Accurate Description</th>
		</tr>
		<tr>
			<td><img src="/resources/chapatiwithkebab.webp" alt="Chapati"></td>
			<td style="font-weight: 500;">Chapati</td>
			<td>give an Description pls</td>
		</tr>
		<tr>
			<td><img src="/resources/khajoor.webp" alt="OofBoiGaming"></td>
			<td style="font-weight: 500;">OofBoiGaming</td>
			<td>i need a Description guys</td>
		</tr>
		<tr>
			<td><img src="/resources/fries.webp" alt="Vertical"></td>
			<td style="font-weight: 500;">Vertical</td>
			<td>please help i need a Description</td>
		</tr>
		<tr>
			<td><img src="/resources/sandwich.webp" alt="Abd"></td>
			<td style="font-weight: 500;">Abd</td>
			<td>man idk just give a Description please man</td>
		</tr>
		<tr>
			<td><img src="/resources/pancake.webp" alt="Mirmi"></td>
			<td style="font-weight: 500;">Minefraftmirmi</td>
			<td>PLEASE DUDE JUST GIVE A Description</td>
		</tr>
		<tr>
			<td><img src="/resources/cherry.webp" alt="Musab"></td>
			<td style="font-weight: 500;">Musab</td>
			<td>I AM BEGGING YOU PLEASE MAN GIVE A Description</td>
		</tr>
	</table>
	<div style="position: absolute; left: 0; top: 1050px; height: 20px; width: 100vw; background-color: transparent;"/>
</main>

<style>
	.invert {
		transform: scaleY(-1);
	}
	.background {
		position: absolute;
		top: 0; 
		left: 0;
		width: 100vw;
		height: 100vh;
		filter: brightness(30%);
		background-image: url('/resources/rhombusgrid.webp');
		background-size: cover;
	}
	.maintext {
		position: absolute;
		transform: translateX(-50%);
		left: 50%;
		top: 60px;
		width: 500px;
		color: white;
		font-weight: 700;
		font-size: 45px;
		text-align: center;
	}
	/*  daTaTable */
	.datatable {
    width: 95%;
		position: absolute;
		top: 220px;
		left: 3%;
    border-collapse: collapse;
    border-radius: 10px;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
    overflow: hidden;
	}

.datatable th,
.datatable td {
    padding: 10px;
    text-align: center;
    border: 2px solid white; /* Add border style to td */
		font-size: 20px;
}

.datatable th {
    background-color: #f4f4f4;
    color: black;
}

.datatable td {
    background-color: transparent;
    color: white;
}

.datatable img {
    max-width: 100px;
    border-radius: 5px;
}
</style>