#include <SoftwareSerial.h>
#define RxD 3
#define TxD 4
SoftwareSerial blueToothSerial(RxD,TxD);
char values[2];
byte pin[6]={6,7,8,9,10,1};
//L,SL,M,SR,R,M
//0 1  2 3  4 5
int count=0;
int i=0;
void setupBlueToothConnection()
{
  blueToothSerial.begin(9600);
  delay(2000);
  blueToothSerial.flush();
}
//This function blink each LED and turn on the vibrator
void roundabout(byte exit)
{
  for(count=0;count<exit;count++)
  {
    for(i=0;i<6;i++)
    {
      digitalWrite(pin[i],HIGH);
    }
    delay(500);
    for(i=0;i<6;i++)
    {
      digitalWrite(pin[i],LOW);
    }
    delay(500);
  }
}
//This function set LOW every output
void off()
{
  for(count=0;count<6;count++)
  {
    digitalWrite(pin[count],LOW);
  }
}
//This function blink a specific LED 3 times. With a specified interval
void blink(byte number, int duration)
{
  for(i=0;i<3;i++)
  {
     digitalWrite(pin[number],HIGH);
     digitalWrite(pin[5],HIGH);
     delay(duration);
     digitalWrite(pin[number],LOW);
     digitalWrite(pin[5],LOW);
     delay(duration);
  }
}
void setup() 
{ 
  pinMode(RxD, INPUT);
  pinMode(TxD, OUTPUT);
  setupBlueToothConnection();
  for(count=0;count<6;count++)
  {
    pinMode(pin[count],OUTPUT);
  }
  //Initiate 5 led and the motor as output
  count=0;
} 
void loop() 
{ 
    if(blueToothSerial.available()){
      values[count] = blueToothSerial.read();
      count++;
    }
    if(count==2)
    {
      switch(values[0])
      {
        case 'x':
          count=2;
        break;
        case 'l':
          count=0;
        break;
        case 'r':
          count=4;
        break;
        case 'b':
        break;
        case '1':
          roundabout(1);
        break;
        case '2':
          roundabout(2);
        break;
        case '3':
          roundabout(3);
        break;
        case '4':
          roundabout(4);
        break;
        case '5':
          roundabout(5);
        break;
        case '6':
          roundabout(6);
        break;
        case '7':
          roundabout(7);
        break;
        case 's':
          count=1;
        break;
        case 'z':
          count=3;
        break;
        case 'c':
          off();
        break;
      }
      switch(values[1])
      {
        case '1':
          blink(count,500);
        break;
        case '2':
          blink(count,250);
        break;
        case '3':
          blink(count,125);
        break;
        case '4':
        break;
      }
      count=0;
    }
    delay(100);
}
