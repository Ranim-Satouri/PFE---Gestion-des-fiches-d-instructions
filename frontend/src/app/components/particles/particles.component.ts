import { Component, AfterViewInit } from '@angular/core';
import { loadFull } from 'tsparticles'; // ✅ Use tsparticles
import { Engine } from '@tsparticles/engine'; // ✅ Correct Engine import

@Component({
  selector: 'app-particles',
  standalone: true,
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.css'],
})
export class ParticlesComponent implements AfterViewInit {
  async ngAfterViewInit(): Promise<void> {
    try {
      const engine = (await import('@tsparticles/engine')).tsParticles;
      await loadFull(engine); // ✅ Fix engine loading

      const container = await (await import('@tsparticles/engine')).tsParticles.load({
        id: 'tsparticles',
        options: {
          background: {
            color: '#ffffff', // Couleur de fond du canvas
          },
          interactivity: {
            events: {
              onClick: { enable: true, mode: 'push' }, // Ajoute des particules au clic
              onHover: { enable: true, mode: 'repulse' }, // Repousse les particules au survol
            },
            modes: {
              push: { quantity: 6 }, // Nombre de particules ajoutées au clic
              repulse: { distance: 100 }, // Distance de répulsion des particules
            },
          },
          particles: {
            number: {
              value: 100, // Nombre de particules au debut
            },
            color: {
              value: [
                "#005eff", // Bleu foncé
                "#00A2F1",
                "#0098F4",
              ],},
            links: {
              enable: true, // Active les liens entre les particules
              opacity: 0.3, // Opacité des liens
              distance: 200, // Distance maximale pour former un lien
              color: '#adcbff', // Couleur des liens
            },
            move: {
              enable: true, // Active le mouvement des particules
              speed: { min: 1, max: 3 }, // Vitesse de déplacement des particules
            },
            opacity: {
              value: { min: 0.3, max: 0.7 }, // Opacité des particules
            },
            size: {
              value: { min: 0.6, max: 4 }, // Taille des particules
            },
          },
        },
      });

      console.log('Particles Loaded:', container);
    } catch (error) {
      // console.error('Error loading particles:');
    }
  }
}
