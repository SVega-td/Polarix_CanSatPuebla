using System.ComponentModel.DataAnnotations;

namespace CanSat_Tecnm.Models
{
    public class Telemetria
    {
        [Key]
        public int Id { get; set; }
        public float Tiempo { get; set; }
        public float Temperatura { get; set; }
        public float Humedad { get; set; }
        public float Presion { get; set; }
        public float Altitud { get; set; }
        public float Velocidad { get; set; }
        public float Aceleracion { get; set; }
        public float Vibracion { get; set; }
        public double Latitud { get; set; }
        public double Longitud { get; set; }
        public int EstadoMision { get; set; }
    }
}